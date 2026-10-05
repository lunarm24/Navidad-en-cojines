# Navidad en cojines

Tienda estática publicada en GitHub Pages. El inventario se mantiene manualmente en `inventory.json`.

## Actualizar existencias

1. Abre `/admin` y pulsa **Editar inventario en GitHub**, o edita `inventory.json` directamente en la rama `main`.
2. Cambia solo la cantidad de la referencia. Por ejemplo, usa `"1": 0` para marcar la referencia 1 como agotada.
3. Guarda el cambio en GitHub. El workflow publicará la actualización en Pages.

La tienda deriva `disponible` automáticamente: si la cantidad es mayor que cero, vale `true`; si es cero, vale `false` y el producto aparece como **Agotado**. No hace falta editar un segundo campo.

La tienda está en `https://lunarm24.github.io/Navidad-en-cojines/` y la consulta de existencias en `https://lunarm24.github.io/Navidad-en-cojines/admin`.

## Registrar y eliminar ventas en el computador

Al abrir esta carpeta en VS Code, la tarea **Run local store** inicia automáticamente el servidor local. Luego abre `http://localhost:8001`. Si VS Code pregunta si permites tareas automáticas, acéptalo y marca esta carpeta como confiable. También puedes iniciar el servidor manualmente con `py server.py 8001`. En el panel de administración, agrega una o varias referencias y sus cantidades, selecciona si el pago fue en efectivo o digital, revisa el total con las promociones del catálogo y pulsa **Registrar venta y descontar inventario**. Cada operación actualiza `inventory.json` y guarda en `sales.json` tanto el método de pago como el historial.

El resumen de ventas muestra también cuánto se recibió en efectivo y cuánto por medios digitales; cada registro del historial indica su método de pago.

Para revertir una operación, pulsa **Eliminar venta** en su registro y confirma. El servidor elimina el registro y devuelve al inventario las cantidades asociadas a esa venta.

Estos cambios son archivos locales del computador y no se publican automáticamente en GitHub Pages. La tienda publicada sigue siendo estática y no puede escribir en los archivos del repositorio.
