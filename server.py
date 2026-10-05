import json
import os
import tempfile
import sys
import threading
import uuid
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent
INVENTORY_PATH = ROOT / "inventory.json"
SALES_PATH = ROOT / "sales.json"
PRODUCT_IDS = {str(product_id) for product_id in range(1, 25)}
PRICE_BY_REMAINDER = (0, 40000, 70000, 100000)
STATE_LOCK = threading.RLock()
MAX_REQUEST_BYTES = 1024 * 1024


class RequestError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status


def read_inventory():
    try:
        with INVENTORY_PATH.open(encoding="utf-8") as inventory_file:
            inventory = json.load(inventory_file)
    except (OSError, json.JSONDecodeError) as error:
        raise RequestError(500, f"No se pudo leer inventory.json: {error}") from error

    if not isinstance(inventory, dict):
        raise RequestError(500, "inventory.json debe contener un objeto de existencias.")

    for product_id in PRODUCT_IDS:
        quantity = inventory.get(product_id)
        if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 0:
            raise RequestError(500, f"El stock de la referencia {product_id} no es válido en inventory.json.")
    return inventory


def read_sales():
    if not SALES_PATH.exists():
        return []
    try:
        with SALES_PATH.open(encoding="utf-8") as sales_file:
            sales = json.load(sales_file)
    except (OSError, json.JSONDecodeError) as error:
        raise RequestError(500, f"No se pudo leer sales.json: {error}") from error

    if not isinstance(sales, list):
        raise RequestError(500, "sales.json debe contener una lista de ventas.")
    for sale in sales:
        if (
            not isinstance(sale, dict)
            or not isinstance(sale.get("id"), str)
            or not isinstance(sale.get("createdAt"), str)
            or not isinstance(sale.get("total"), int)
            or isinstance(sale.get("total"), bool)
            or sale["total"] < 0
            or (
                sale.get("paymentMethod") is not None
                and (
                    not isinstance(sale["paymentMethod"], str)
                    or sale["paymentMethod"] not in {"cash", "digital"}
                )
            )
            or not isinstance(sale.get("items"), list)
            or not sale["items"]
        ):
            raise RequestError(500, "sales.json contiene una venta con formato inválido.")
        for item in sale["items"]:
            if (
                not isinstance(item, dict)
                or not isinstance(item.get("id"), str)
                or item["id"] not in PRODUCT_IDS
                or not isinstance(item.get("quantity"), int)
                or isinstance(item.get("quantity"), bool)
                or item["quantity"] < 1
            ):
                raise RequestError(500, "sales.json contiene una referencia o cantidad inválida.")
    return sales


def write_json_files(inventory, sales):
    replacements = ((INVENTORY_PATH, inventory), (SALES_PATH, sales))
    temporary_paths = []
    try:
        for path, value in replacements:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=ROOT,
                prefix=f".{path.stem}-",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                json.dump(value, temporary_file, ensure_ascii=False, indent=2)
                temporary_file.write("\n")
                temporary_paths.append((Path(temporary_file.name), path))

        for temporary_path, target_path in temporary_paths:
            os.replace(temporary_path, target_path)
    except OSError as error:
        raise RequestError(500, f"No se pudieron guardar los archivos JSON: {error}") from error
    finally:
        for temporary_path, _ in temporary_paths:
            temporary_path.unlink(missing_ok=True)


def sale_price(quantity):
    bundles, remainder = divmod(quantity, 4)
    return bundles * 130000 + PRICE_BY_REMAINDER[remainder]


def clean_sale_items(value):
    if not isinstance(value, list) or not value:
        raise RequestError(400, "Agrega por lo menos una referencia a la venta.")

    quantities = {}
    for item in value:
        if not isinstance(item, dict):
            raise RequestError(400, "El formato de los productos de la venta no es válido.")
        product_id = item.get("id")
        quantity = item.get("quantity")
        if not isinstance(product_id, str) or product_id not in PRODUCT_IDS:
            raise RequestError(400, "La venta contiene una referencia desconocida.")
        if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
            raise RequestError(400, "Cada cantidad debe ser un número entero mayor que cero.")
        quantities[product_id] = quantities.get(product_id, 0) + quantity
    return [{"id": product_id, "quantity": quantity} for product_id, quantity in quantities.items()]


class StoreHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, value):
        encoded = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def send_error_json(self, error):
        self.send_json(error.status, {"error": str(error)})

    def do_GET(self):
        path = urlsplit(self.path).path.rstrip("/")
        if path == "/api/state":
            try:
                with STATE_LOCK:
                    self.send_json(200, {"inventory": read_inventory(), "sales": read_sales()})
            except RequestError as error:
                self.send_error_json(error)
            return
        super().do_GET()

    def do_POST(self):
        path = urlsplit(self.path).path.rstrip("/")
        if path not in {"/api/sales", "/api/sales/import"}:
            self.send_json(404, {"error": "Ruta no encontrada."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length < 1 or content_length > MAX_REQUEST_BYTES:
                raise RequestError(400, "El cuerpo de la solicitud está vacío o es demasiado grande.")
            try:
                body = json.loads(self.rfile.read(content_length))
            except (json.JSONDecodeError, UnicodeDecodeError) as error:
                raise RequestError(400, "La solicitud debe contener JSON válido.") from error

            with STATE_LOCK:
                inventory = read_inventory()
                sales = read_sales()
                if path == "/api/sales/import":
                    legacy_sales = body.get("sales") if isinstance(body, dict) else None
                    if not isinstance(legacy_sales, list) or not legacy_sales:
                        raise RequestError(400, "No hay ventas locales válidas para importar.")
                    if sales:
                        raise RequestError(409, "El historial de ventas del servidor ya contiene registros.")

                    imported_sales = []
                    total_quantities = {}
                    for legacy_sale in legacy_sales:
                        if (
                            not isinstance(legacy_sale, dict)
                            or not isinstance(legacy_sale.get("createdAt"), str)
                            or not isinstance(legacy_sale.get("total"), int)
                            or isinstance(legacy_sale.get("total"), bool)
                            or legacy_sale["total"] < 0
                            or (
                                legacy_sale.get("paymentMethod") is not None
                                and (
                                    not isinstance(legacy_sale["paymentMethod"], str)
                                    or legacy_sale["paymentMethod"] not in {"cash", "digital"}
                                )
                            )
                        ):
                            raise RequestError(400, "Hay una venta local con datos inválidos.")
                        items = clean_sale_items(legacy_sale.get("items"))
                        for item in items:
                            total_quantities[item["id"]] = total_quantities.get(item["id"], 0) + item["quantity"]
                        imported_sales.append({
                            "id": str(uuid.uuid4()),
                            "createdAt": legacy_sale["createdAt"],
                            "items": items,
                            "total": legacy_sale["total"],
                            **(
                                {"paymentMethod": legacy_sale["paymentMethod"]}
                                if isinstance(legacy_sale.get("paymentMethod"), str)
                                and legacy_sale["paymentMethod"] in {"cash", "digital"}
                                else {}
                            ),
                        })

                    for product_id, quantity in total_quantities.items():
                        if inventory[product_id] < quantity:
                            raise RequestError(
                                409,
                                f"No hay existencias suficientes para importar las ventas de la referencia {product_id}.",
                            )
                        inventory[product_id] -= quantity
                    write_json_files(inventory, imported_sales)
                    self.send_json(201, {"inventory": inventory, "sales": imported_sales})
                    return

                items = clean_sale_items(body.get("items") if isinstance(body, dict) else None)
                payment_method = body.get("paymentMethod") if isinstance(body, dict) else None
                if not isinstance(payment_method, str) or payment_method not in {"cash", "digital"}:
                    raise RequestError(400, "Selecciona efectivo o pago digital.")
                for item in items:
                    product_id = item["id"]
                    if inventory[product_id] < item["quantity"]:
                        raise RequestError(
                            409,
                            f"Solo hay {inventory[product_id]} unidades disponibles de la referencia {product_id}.",
                        )

                for item in items:
                    inventory[item["id"]] -= item["quantity"]
                quantity = sum(item["quantity"] for item in items)
                sales.append({
                    "id": str(uuid.uuid4()),
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                    "items": items,
                    "total": sale_price(quantity),
                    "paymentMethod": payment_method,
                })
                write_json_files(inventory, sales)
                self.send_json(201, {"inventory": inventory, "sales": sales})
        except (ValueError, RequestError) as error:
            self.send_error_json(error if isinstance(error, RequestError) else RequestError(400, str(error)))

    def do_DELETE(self):
        path = unquote(urlsplit(self.path).path).rstrip("/")
        prefix = "/api/sales/"
        if not path.startswith(prefix):
            self.send_json(404, {"error": "Ruta no encontrada."})
            return
        sale_id = path[len(prefix):]
        if not sale_id or "/" in sale_id:
            self.send_json(400, {"error": "El identificador de venta no es válido."})
            return

        try:
            with STATE_LOCK:
                inventory = read_inventory()
                sales = read_sales()
                sale = next((item for item in sales if item.get("id") == sale_id), None)
                if sale is None:
                    raise RequestError(404, "No se encontró esa venta.")
                for item in sale.get("items", []):
                    if not isinstance(item, dict):
                        raise RequestError(500, "La venta guardada tiene un producto inválido.")
                    product_id = item.get("id")
                    quantity = item.get("quantity")
                    if (
                        not isinstance(product_id, str)
                        or product_id not in PRODUCT_IDS
                        or not isinstance(quantity, int)
                        or isinstance(quantity, bool)
                        or quantity < 1
                    ):
                        raise RequestError(500, "La venta guardada tiene productos o cantidades inválidas.")
                    inventory[product_id] += quantity

                updated_sales = [item for item in sales if item.get("id") != sale_id]
                write_json_files(inventory, updated_sales)
                self.send_json(200, {"inventory": inventory, "sales": updated_sales})
        except RequestError as error:
            self.send_error_json(error)

    def log_message(self, message_format, *args):
        super().log_message(message_format, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
    server = ThreadingHTTPServer(("127.0.0.1", port), StoreHandler)
    print(f"Tienda disponible en http://localhost:{port} (solo en este computador).")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    finally:
        server.server_close()
