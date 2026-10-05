/* Productos */
const PHONE = "573217096231";
const INVENTORY_FILE = new URL("inventory.json", document.currentScript.src).href;
const ASSET_BASE = new URL(".", document.currentScript.src);
const API_BASE = new URL("api/", ASSET_BASE);
const SALES_STORAGE_KEY = "navidad-en-cojines.sales.v1";
const defaultProducts = [
  { id: "1", name: "Ciervo y conejo", description: "Bordado navideño de ciervo y conejo.", image: "imagenes/1. Cojín bordado de invierno con ciervo y conejo.png" },
  { id: "2", name: "Santa y árbol", description: "Bordado navideño de Santa junto al árbol.", image: "imagenes/2. Cojín navideño bordado con Santa y árbol.png" },
  { id: "3", name: "Reno y muñeco", description: "Bordado de reno y muñeco de nieve.", image: "imagenes/3. Cojín navideño bordado con reno y muñeco de nieve.png" },
  { id: "4", name: "Reno y árbol", description: "Bordado navideño de un reno junto al árbol.", image: "imagenes/4. Cojín bordado navideño con reno y árbol.png" },
  { id: "5", name: "Muñeco de nieve", description: "Muñeco tejido con gorro y bufanda azul sobre fondo nevado.", image: "imagenes/5. Cojín navideño con muñeco de nieve tejido.png" },
  { id: "6", name: "Reno de invierno", description: "Reno tejido con bufanda azul, astas decoradas y fondo nevado.", image: "imagenes/6. Imagen de ChatGPT 4 oct 2026, 22_20_19.png" },
  { id: "7", name: "Árbol de Navidad", description: "Árbol navideño tejido, decorado con copos y esferas.", image: "imagenes/7. Imagen de ChatGPT 4 oct 2026, 22_20_49.png" },
  { id: "8", name: "Santa Claus", description: "Santa tejido con gorro y bufanda azul entre copos de nieve.", image: "imagenes/8. Imagen de ChatGPT 4 oct 2026, 22_21_12.png" },
  { id: "9", name: "Santa dorado", description: "Santa Claus con traje dorado, regalos y adornos navideños.", image: "imagenes/9. Imagen de ChatGPT 4 oct 2026, 22_26_49-1.png" },
  { id: "10", name: "Reno dorado", description: "Reno con astas decoradas y detalles dorados de Navidad.", image: "imagenes/10. Imagen de ChatGPT 4 oct 2026, 22_26_52-4.png" },
  { id: "11", name: "Muñeco de nieve dorado", description: "Muñeco de nieve con gorro y bufanda dorados.", image: "imagenes/11. Imagen de ChatGPT 4 oct 2026, 22_26_51-3.png" },
  { id: "12", name: "Árbol dorado", description: "Árbol de Navidad decorado con esferas y regalos dorados.", image: "imagenes/12. Imagen de ChatGPT 4 oct 2026, 22_26_50-2.png" },
  { id: "13", name: "Muñeco de nieve", description: "Muñeco sonriente con gorro tejido y bufanda dorada.", image: "imagenes/13. Imagen de ChatGPT 4 oct 2026, 22_42_03-4.png" },
  { id: "14", name: "Santa con guantes", description: "Santa Claus con guantes rojos decorados con copos de nieve.", image: "imagenes/14. Imagen de ChatGPT 4 oct 2026, 22_42_02-3.png" },
  { id: "15", name: "Santa con regalo", description: "Santa Claus sostiene un regalo verde con moño rojo.", image: "imagenes/15. Imagen de ChatGPT 4 oct 2026, 22_42_01-2.png" },
  { id: "16", name: "Reno", description: "Reno sonriente con gorro navideño y bufanda roja.", image: "imagenes/16. Imagen de ChatGPT 4 oct 2026, 22_42_00-1.png" },
  { id: "17", name: "Muñeco de nieve y reno", description: "Muñeco de nieve junto a un reno entre flores navideñas.", image: "imagenes/17. Imagen de ChatGPT 4 oct 2026, 22_52_57-1.png" },
  { id: "18", name: "Reno y conejo", description: "Reno y conejo bordados juntos entre flores de Nochebuena.", image: "imagenes/18. Imagen de ChatGPT 4 oct 2026, 22_52_59-2.png" },
  { id: "19", name: "Santa y árbol", description: "Santa Claus saluda junto a un árbol navideño decorado y regalos.", image: "imagenes/19. Imagen de ChatGPT 4 oct 2026, 22_52_59-3.png" },
  { id: "20", name: "Reno y árbol", description: "Reno bordado junto a un árbol de Navidad decorado.", image: "imagenes/20. Imagen de ChatGPT 4 oct 2026, 22_53_00-4.png" },
  { id: "21", name: "Bota navideña", description: "Bota azul decorada con bordados dorados, flores y regalos.", image: "imagenes/21. Imagen de ChatGPT 4 oct 2026, 23_05_22-3.png" },
  { id: "22", name: "Muñeco de nieve floral", description: "Muñeco de nieve con sombrero azul, rodeado de flores y adornos.", image: "imagenes/22. Imagen de ChatGPT 4 oct 2026, 23_05_23-4.png" },
  { id: "23", name: "Faroles con velas", description: "Faroles decorativos con velas encendidas entre flores navideñas.", image: "imagenes/23. Imagen de ChatGPT 4 oct 2026, 23_05_20-1.png" },
  { id: "24", name: "Santa entre rosas", description: "Santa Claus de azul rodeado de rosas y flores invernales.", image: "imagenes/24. Imagen de ChatGPT 4 oct 2026, 23_05_21-2.png" }
];
let products = [];
let serverBackedStorage = false;

async function loadInventory() {
  const response = await fetch(`${INVENTORY_FILE}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar el inventario (${response.status}).`);
  const inventory = await response.json();
  if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) {
    throw new Error("El archivo de inventario no tiene un formato válido.");
  }
  return inventory;
}

async function loadState() {
  const response = await fetch(new URL("state", API_BASE), { cache: "no-store" });
  if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
    const state = await response.json();
    if (!state.inventory || typeof state.inventory !== "object" || !Array.isArray(state.sales)) {
      throw new Error("El servidor devolvió un estado de inventario o ventas no válido.");
    }
    serverBackedStorage = true;
    if (state.sales.length === 0) {
      const legacySales = loadSales();
      if (legacySales.length > 0) {
        try {
          const importedState = await requestApi(new URL("sales/import", API_BASE), {
            method: "POST",
            body: JSON.stringify({ sales: legacySales })
          });
          localStorage.removeItem(SALES_STORAGE_KEY);
          return importedState;
        } catch (error) {
          if (error.status !== 409) throw error;
          const latestState = await fetch(new URL("state", API_BASE), { cache: "no-store" });
          if (!latestState.ok) throw new Error(`No se pudo recargar el inventario (${latestState.status}).`);
          return latestState.json();
        }
      }
    }
    return state;
  }
  if (response.status !== 404) {
    throw new Error(`No se pudo cargar el estado del servidor (${response.status}).`);
  }

  serverBackedStorage = false;
  return { inventory: await loadInventory(), sales: loadSales() };
}

function loadSales() {
  const storedSales = localStorage.getItem(SALES_STORAGE_KEY);
  if (storedSales === null) return [];

  let sales;
  try {
    sales = JSON.parse(storedSales);
  } catch (error) {
    throw new Error(`El historial de ventas guardado no es válido: ${error.message}`);
  }
  if (!Array.isArray(sales)) throw new Error("El historial de ventas guardado no tiene un formato válido.");

  for (const sale of sales) {
    if (
      !sale
      || typeof sale !== "object"
      || typeof sale.createdAt !== "string"
      || !Number.isFinite(Date.parse(sale.createdAt))
      || !Number.isInteger(sale.total)
      || sale.total < 0
      || (sale.paymentMethod !== undefined && !["cash", "digital"].includes(sale.paymentMethod))
      || !Array.isArray(sale.items)
      || sale.items.length === 0
      || sale.items.some((item) => (
        !item
        || !defaultProducts.some((product) => product.id === item.id)
        || !Number.isInteger(item.quantity)
        || item.quantity < 1
      ))
    ) {
      throw new Error("El historial de ventas guardado contiene una venta inválida.");
    }
  }
  return sales;
}

function saveLegacySales(sales) {
  localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
}

function productsFromInventory(inventory, sales = [], salesAlreadyApplied = false) {
  const soldQuantities = new Map();
  if (!salesAlreadyApplied) {
    for (const sale of sales) {
      for (const item of sale.items) {
        soldQuantities.set(item.id, (soldQuantities.get(item.id) || 0) + item.quantity);
      }
    }
  }
  return defaultProducts.map((product) => {
    const value = inventory[product.id];
    const startingStock = Number.isInteger(value) && value >= 0 ? value : 0;
    const stock = Math.max(0, startingStock - (soldQuantities.get(product.id) || 0));
    return { ...product, stock, disponible: stock > 0 };
  });
}

/* Ilustraciones SVG reemplazables por fotografías usando product.image. */
function cushionSvg(product) {
  if (product.image) {
    return `<img class="product-art" src="${new URL(product.image, ASSET_BASE).href}" alt="Cojín ${product.name}" loading="lazy">`;
  }
  const motifs = {
    tree: `<path d="M100 48 73 83h16L67 105h24l-14 21h46l-14-21h24l-22-22h16z" fill="${product.ink}"/><rect x="95" y="125" width="10" height="15" rx="2" fill="#8b6545"/><circle cx="100" cy="69" r="4" fill="${product.accent}"/><circle cx="86" cy="101" r="4" fill="${product.accent}"/><circle cx="113" cy="111" r="4" fill="${product.accent}"/>`,
    snowflake: `<g stroke="${product.ink}" stroke-width="5" stroke-linecap="round"><path d="M100 54v92M60 77l80 46M60 123l80-46"/><path d="m100 54-10 12m10-12 10 12m-10 80-10-12m10 12 10-12M60 77l16 2m-16-2 5 15m75 31-16-2m16 2-5-15M60 123l5-15m-5 15 16-2m64-44-5 15m5-15-16 2" stroke-width="3"/></g>`,
    star: `<path d="m100 48 13 31 34 3-26 22 8 33-29-18-29 18 8-33-26-22 34-3z" fill="${product.ink}"/><circle cx="100" cy="100" r="58" fill="none" stroke="${product.accent}" stroke-width="2" stroke-dasharray="3 8"/>`,
    candy: `<path d="M78 137V81a23 23 0 0 1 46 0v12" fill="none" stroke="${product.ink}" stroke-width="17" stroke-linecap="round"/><path d="M78 111h17m-17-19h17m3-32 12 14m4-20 13 15m-2 37h17" stroke="${product.accent}" stroke-width="8" stroke-linecap="round"/>`,
    dots: `<g fill="${product.ink}"><circle cx="67" cy="69" r="6"/><circle cx="102" cy="60" r="4"/><circle cx="134" cy="76" r="7"/><circle cx="82" cy="102" r="5"/><circle cx="119" cy="105" r="8"/><circle cx="62" cy="134" r="4"/><circle cx="99" cy="139" r="6"/><circle cx="140" cy="132" r="4"/></g><g fill="${product.accent}"><circle cx="83" cy="80" r="3"/><circle cx="126" cy="57" r="3"/><circle cx="58" cy="105" r="3"/><circle cx="144" cy="105" r="3"/></g>`,
    snowman: `<circle cx="100" cy="119" r="26" fill="${product.accent}"/><circle cx="100" cy="79" r="20" fill="#fffdf9"/><circle cx="93" cy="76" r="2.5" fill="${product.ink}"/><circle cx="107" cy="76" r="2.5" fill="${product.ink}"/><path d="m100 81 14 5-14 4z" fill="#d17b43"/><path d="M82 54h36v7H82zm7-11h22v11H89z" fill="${product.ink}"/><path d="M75 94h50" stroke="${product.ink}" stroke-width="5"/><circle cx="100" cy="113" r="2.5" fill="${product.ink}"/><circle cx="100" cy="124" r="2.5" fill="${product.ink}"/>`,
    plaid: `<rect x="57" y="57" width="86" height="86" rx="4" fill="none" stroke="${product.ink}" stroke-width="12"/><path d="M73 58v84m27-84v84m27-84v84M58 73h84m-84 27h84m-84 27h84" stroke="${product.accent}" stroke-width="7"/><path d="M57 57h86v86H57z" fill="none" stroke="#fffdf9" stroke-width="2"/>`,
    ornament: `<path d="M94 64h12v13H94z" fill="${product.accent}"/><path d="M100 77c-21 0-31 15-31 34 0 23 14 37 31 37s31-14 31-37c0-19-10-34-31-34z" fill="${product.ink}"/><path d="M100 82c-15 15-18 43 0 61m0-61c15 15 18 43 0 61" fill="none" stroke="${product.accent}" stroke-width="3"/><path d="M100 52v12" stroke="${product.accent}" stroke-width="4"/>`
  };
  return `<svg class="product-art" viewBox="0 0 200 200" role="img" aria-label="Ilustración del cojín ${product.name}" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="${product.fabric}"/><rect x="35" y="35" width="130" height="130" rx="24" fill="${product.fabric}" stroke="#fffdf9" stroke-width="5"/><rect x="42" y="42" width="116" height="116" rx="19" fill="none" stroke="${product.ink}" stroke-opacity=".12" stroke-width="2"/><g>${motifs[product.motif]}</g><circle cx="53" cy="53" r="2" fill="${product.accent}" opacity=".6"/><circle cx="147" cy="147" r="2" fill="${product.accent}" opacity=".6"/></svg>`;
}

/* Carrito */
const cart = new Map();
const priceScale = [0, 40000, 70000, 100000];
const money = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const productGrid = document.querySelector("#product-grid");
const cartList = document.querySelector("#cart-list");
const drawer = document.querySelector("#order-drawer");
const backdrop = document.querySelector("#drawer-backdrop");
const openButton = document.querySelector("#open-order");
const closeButton = document.querySelector("#close-order");
const inventoryList = document.querySelector("#inventory-list");
const inventoryTotal = document.querySelector("#inventory-total");
const adminStatus = document.querySelector("#admin-status");
const storeStatus = document.querySelector("#store-status");
const saleProductSelect = document.querySelector("#sale-product");
const saleQuantityInput = document.querySelector("#sale-quantity");
const saleDraftList = document.querySelector("#sale-draft");
const saleEstimate = document.querySelector("#sale-estimate");
const salePromotion = document.querySelector("#sale-promotion");
const registerSaleButton = document.querySelector("#register-sale");
const saleStatus = document.querySelector("#sale-status");
const salesHistory = document.querySelector("#sales-history");
const cartFeedback = document.querySelector("#cart-feedback");
const cartFeedbackMessage = document.querySelector("#cart-feedback-message");
const salesChannel = typeof BroadcastChannel === "undefined"
  ? null
  : new BroadcastChannel("navidad-en-cojines-sales");
let lastFocusedElement = null;
let drawerTimer;
let sales = [];
let inventorySource = null;
const saleDraft = new Map();
let cartFeedbackTimer;

function formatPrice(value) {
  return `$${money.format(value)}`;
}

function updateVisibleInventory(inventory, savedSales = null) {
  inventorySource = inventory;
  sales = savedSales || loadSales();
  products = productsFromInventory(inventory, sales, serverBackedStorage);
  for (const [id, quantity] of cart) {
    const product = products.find((item) => item.id === id);
    if (!product || product.stock === 0) cart.delete(id);
    else if (quantity > product.stock) cart.set(id, product.stock);
  }
  if (productGrid) renderProducts();
  if (cartList) renderCart();
  if (inventoryList) renderInventory();
  if (saleProductSelect) renderSaleForm();
  if (salesHistory) renderSales();
}

function setAdminStatus(message, isError = false) {
  if (!adminStatus) return;
  adminStatus.textContent = message;
  adminStatus.dataset.error = String(isError);
}

function totalPrice(quantity) {
  const bundles = Math.floor(quantity / 4);
  const remainder = quantity % 4;
  return bundles * 130000 + priceScale[remainder];
}

function promotionDescription(quantity) {
  if (quantity === 0) return "Agrega productos para calcular la promoción.";
  const bundles = Math.floor(quantity / 4);
  const remainder = quantity % 4;
  const parts = [];
  if (bundles > 0) parts.push(`${bundles} promoción${bundles === 1 ? "" : "es"} de 4`);
  if (remainder > 0) parts.push(`${remainder} ${remainder === 1 ? "unidad" : "unidades"} adicionales`);
  return `Promoción aplicada: ${parts.join(" + ")}.`;
}

function cartQuantity() {
  return [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
}

function renderProducts() {
  productGrid.innerHTML = products.length ? products.map((product) => `
    <article class="product-card" data-disponible="${product.disponible}">
      ${cushionSvg(product)}
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Agregar ${product.name} al pedido" ${!product.disponible || product.stock <= (cart.get(product.id) || 0) ? "disabled" : ""}>${!product.disponible ? "Agotado" : product.stock <= (cart.get(product.id) || 0) ? "Máximo en el pedido" : "Agregar al pedido"}</button>
      </div>
    </article>`).join("") : `<p class="inventory-empty">No hay cojines disponibles en este momento.</p>`;
  const heroProducts = ["6", "1", "11"].map((id) => products.find((product) => product.id === id) || products[0]).filter(Boolean);
  document.querySelectorAll("#hero-art .hero-pillow").forEach((pillow, index) => {
    const product = heroProducts[index];
    pillow.hidden = !product;
    pillow.innerHTML = product ? cushionSvg(product) : "";
  });
}

function renderInventory() {
  const totalStock = products.reduce((total, product) => total + product.stock, 0);
  if (inventoryTotal) {
    inventoryTotal.textContent = `Total en inventario: ${totalStock} ${totalStock === 1 ? "cojín" : "cojines"}`;
  }
  if (products.length === 0) {
    inventoryList.innerHTML = `<p class="inventory-empty">No quedan referencias en el catálogo.</p>`;
    return;
  }
  inventoryList.innerHTML = products.map((product) => `
    <div class="inventory-row">
      <div class="inventory-product">
        ${cushionSvg(product)}
        <div class="inventory-product-details">
          <strong>${product.name}</strong>
          <span class="inventory-id">ID: ${product.id}</span>
        </div>
      </div>
      <span class="inventory-quantity">${product.stock} ${product.stock === 1 ? "unidad" : "unidades"}</span>
      <span class="inventory-availability ${product.disponible ? "is-available" : "is-sold-out"}">${product.disponible ? "Disponible" : "Agotado"}</span>
    </div>`).join("");
}

function renderSales() {
  const unitsSold = sales.reduce((sum, sale) => (
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
  ), 0);
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const cashRevenue = sales.reduce((sum, sale) => sum + (sale.paymentMethod === "cash" ? sale.total : 0), 0);
  const digitalRevenue = sales.reduce((sum, sale) => sum + (sale.paymentMethod === "digital" ? sale.total : 0), 0);
  document.querySelector("#units-sold").textContent = unitsSold;
  document.querySelector("#sales-count").textContent = sales.length;
  document.querySelector("#sales-revenue").textContent = formatPrice(revenue);
  document.querySelector("#cash-revenue").textContent = formatPrice(cashRevenue);
  document.querySelector("#digital-revenue").textContent = formatPrice(digitalRevenue);

  const orderedSales = sales.map((sale, index) => ({ sale, index })).reverse();
  salesHistory.innerHTML = orderedSales.length ? orderedSales.map(({ sale, index }) => {
    const date = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" })
      .format(new Date(sale.createdAt));
    const itemSummary = sale.items.map((item) => {
      const product = defaultProducts.find((candidate) => candidate.id === item.id);
      return `${item.quantity} × ${product.name} (ID: ${product.id})`;
    }).join(", ");
    const saleUnits = sale.items.reduce((sum, item) => sum + item.quantity, 0);
    const paymentMethod = sale.paymentMethod === "cash"
      ? "Efectivo"
      : sale.paymentMethod === "digital" ? "Digital" : "No especificado";
    return `
      <article class="sales-history-row">
        <div><strong>${date} · ${paymentMethod}</strong><span>${itemSummary}</span></div>
        <span>${saleUnits} ${saleUnits === 1 ? "cojín" : "cojines"}</span>
        <strong>${formatPrice(sale.total)}</strong>
        <button class="sale-remove-button" type="button" data-delete-sale="${serverBackedStorage ? sale.id : index}">Eliminar venta</button>
      </article>`;
  }).join("") : `<p class="inventory-empty">Todavía no hay ventas registradas.</p>`;
}

function renderSaleForm() {
  const selectedId = saleProductSelect.value;
  saleProductSelect.innerHTML = products.map((product) => `
    <option value="${product.id}" ${product.stock === 0 ? "disabled" : ""}>
      ID ${product.id} · ${product.name}${product.stock === 0 ? " · Agotado" : ` · ${product.stock} disponibles`}
    </option>`).join("");
  if (products.some((product) => product.id === selectedId && product.stock > 0)) {
    saleProductSelect.value = selectedId;
  }
  saleQuantityInput.max = products.find((product) => product.id === saleProductSelect.value)?.stock || 1;
  renderSaleDraft();
}

function renderSaleDraft() {
  const draftItems = [...saleDraft.entries()];
  const quantity = draftItems.reduce((sum, [, itemQuantity]) => sum + itemQuantity, 0);
  saleDraftList.innerHTML = draftItems.length ? draftItems.map(([id, itemQuantity]) => {
    const product = defaultProducts.find((candidate) => candidate.id === id);
    return `
      <div class="sale-draft-row">
        <span><strong>ID ${product.id} · ${product.name}</strong><small>${itemQuantity} ${itemQuantity === 1 ? "unidad" : "unidades"}</small></span>
        <button class="sale-remove-button" type="button" data-remove-sale-item="${id}" aria-label="Quitar ${product.name} de la venta">Quitar</button>
      </div>`;
  }).join("") : `<p class="inventory-empty">Agrega una o más referencias para preparar la venta.</p>`;
  salePromotion.textContent = promotionDescription(quantity);
  saleEstimate.textContent = formatPrice(totalPrice(quantity));
  registerSaleButton.disabled = draftItems.length === 0;
}

function setSaleStatus(message, isError = false) {
  saleStatus.textContent = message;
  saleStatus.dataset.error = String(isError);
}

function addSaleItem() {
  const product = products.find((item) => item.id === saleProductSelect.value);
  const quantity = Number(saleQuantityInput.value);
  if (!product || !Number.isInteger(quantity) || quantity < 1) {
    setSaleStatus("Selecciona una referencia y una cantidad válida.", true);
    return;
  }
  const draftQuantity = saleDraft.get(product.id) || 0;
  if (draftQuantity + quantity > product.stock) {
    setSaleStatus(`Solo hay ${product.stock - draftQuantity} unidades disponibles de la referencia ${product.id}.`, true);
    return;
  }
  saleDraft.set(product.id, draftQuantity + quantity);
  saleQuantityInput.value = "1";
  setSaleStatus(`${product.name} se agregó a la venta.`);
  renderSaleDraft();
}

async function requestApi(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || `Error del servidor (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return result;
}

function announceSalesChange() {
  salesChannel?.postMessage("sales-updated");
}

async function refreshServerState() {
  const state = await loadState();
  updateVisibleInventory(state.inventory, state.sales);
}

async function registerSale() {
  const items = [...saleDraft.entries()].map(([id, quantity]) => ({ id, quantity }));
  if (!items.length || !inventorySource) {
    setSaleStatus("No hay productos en la venta o el inventario no está disponible.", true);
    return;
  }
  registerSaleButton.disabled = true;
  for (const item of items) {
    const product = products.find((candidate) => candidate.id === item.id);
    if (!product || item.quantity > product.stock) {
      setSaleStatus(`No hay existencias suficientes para la referencia ${item.id}. Actualiza el inventario antes de continuar.`, true);
      renderSaleDraft();
      return;
    }
  }

  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const paymentMethod = document.querySelector("#sale-payment-method").value;
  if (!["cash", "digital"].includes(paymentMethod)) {
    setSaleStatus("Selecciona un método de pago válido.", true);
    renderSaleDraft();
    return;
  }
  try {
    if (serverBackedStorage) {
      const state = await requestApi(new URL("sales", API_BASE), {
        method: "POST",
        body: JSON.stringify({ items, paymentMethod })
      });
      updateVisibleInventory(state.inventory, state.sales);
      announceSalesChange();
    } else {
      const nextSales = [...sales, {
        createdAt: new Date().toISOString(),
        items,
        total: totalPrice(quantity),
        paymentMethod
      }];
      saveLegacySales(nextSales);
      updateVisibleInventory(inventorySource, nextSales);
    }
  } catch (error) {
    setSaleStatus(`No se pudo guardar la venta: ${error.message}`, true);
    renderSaleDraft();
    return;
  }

  saleDraft.clear();
  renderSaleDraft();
  setSaleStatus(`Venta registrada: ${quantity} ${quantity === 1 ? "cojín" : "cojines"} por ${formatPrice(totalPrice(quantity))}.`);
  setAdminStatus(serverBackedStorage
    ? "Venta e inventario guardados automáticamente en sales.json e inventory.json."
    : "El servidor JSON no está activo; la venta solo se guardó en este navegador.");
}

async function deleteSale(saleKey) {
  if (!window.confirm("¿Eliminar esta venta y devolver sus unidades al inventario?")) return;
  try {
    if (serverBackedStorage) {
      const state = await requestApi(new URL(`sales/${encodeURIComponent(saleKey)}`, API_BASE), {
        method: "DELETE"
      });
      updateVisibleInventory(state.inventory, state.sales);
      announceSalesChange();
    } else {
      const saleIndex = Number(saleKey);
      if (!Number.isInteger(saleIndex) || !sales[saleIndex]) {
        throw new Error("No se encontró esa venta en el historial local.");
      }
      const nextSales = sales.filter((_, index) => index !== saleIndex);
      saveLegacySales(nextSales);
      updateVisibleInventory(inventorySource, nextSales);
    }
    setSaleStatus("Venta eliminada y existencias devueltas al inventario.");
    setAdminStatus(serverBackedStorage
      ? "Venta eliminada; inventory.json y sales.json se actualizaron."
      : "Venta eliminada del historial de este navegador.");
  } catch (error) {
    setSaleStatus(`No se pudo eliminar la venta: ${error.message}`, true);
  }
}

function buildWhatsAppUrl() {
  const lines = products
    .filter((product) => cart.has(product.id))
    .map((product) => `• ${cart.get(product.id)} x ${product.name} (ID: ${product.id})`);
  const message = [
    "Hola, quiero cotizar un pedido en Navidad en cojines:",
    ...lines,
    "",
    `Total de cojines: ${cartQuantity()}`,
    `Valor estimado: ${formatPrice(totalPrice(cartQuantity()))}`
  ].join("\n");
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

function renderCart() {
  const quantity = cartQuantity();
  document.querySelector("#header-count").textContent = quantity;
  openButton.setAttribute("aria-label", `Abrir mi pedido, ${quantity} ${quantity === 1 ? "cojín" : "cojines"}`);
  document.querySelector("#summary-count").textContent = quantity;
  document.querySelector("#summary-total").textContent = formatPrice(totalPrice(quantity));
  const whatsapp = document.querySelector("#whatsapp-link");
  whatsapp.href = buildWhatsAppUrl();
  whatsapp.setAttribute("aria-disabled", String(quantity === 0));
  whatsapp.tabIndex = quantity === 0 ? -1 : 0;

  if (quantity === 0) {
    cartList.innerHTML = `<p class="empty-message">Aún no has agregado cojines. Elige tus favoritos de la colección.</p>`;
    return;
  }

  cartList.innerHTML = products.filter((product) => cart.has(product.id)).map((product) => `
    <div class="cart-row">
      <div class="cart-thumb">${cushionSvg(product)}</div>
      <p class="cart-name">${product.name}</p>
      <div class="quantity-controls" aria-label="Cantidad de ${product.name}">
        <button class="quantity-button" type="button" data-change="${product.id}" data-delta="-1" aria-label="Quitar un cojín ${product.name}">−</button>
        <span class="quantity-number">${cart.get(product.id)}</span>
        <button class="quantity-button" type="button" data-change="${product.id}" data-delta="1" aria-label="Agregar un cojín ${product.name}" ${cart.get(product.id) >= product.stock ? "disabled" : ""}>+</button>
      </div>
    </div>`).join("");
}

function addProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product || !product.disponible || (cart.get(id) || 0) >= product.stock) return false;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  renderProducts();
  showCartFeedback(product.name);
  return true;
}

function showCartFeedback(productName) {
  if (!cartFeedback || !cartFeedbackMessage) return;
  window.clearTimeout(cartFeedbackTimer);
  cartFeedback.classList.remove("is-visible");
  cartFeedbackMessage.textContent = `${productName} ya está en tu pedido`;
  cartFeedback.setAttribute("aria-label", `¡Ho, ho, ho! ${productName} se agregó a tu pedido.`);
  void cartFeedback.offsetWidth;
  cartFeedback.classList.add("is-visible");
  cartFeedbackTimer = window.setTimeout(() => cartFeedback.classList.remove("is-visible"), 3600);
}

function openDrawer() {
  if (drawer.classList.contains("is-open")) return;
  lastFocusedElement = document.activeElement;
  clearTimeout(drawerTimer);
  backdrop.hidden = false;
  drawer.inert = false;
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  requestAnimationFrame(() => {
    backdrop.classList.add("is-open");
    drawer.classList.add("is-open");
    closeButton.focus();
  });
}

function closeDrawer() {
  if (!drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  backdrop.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  drawer.inert = true;
  document.body.classList.remove("drawer-open");
  if (lastFocusedElement) lastFocusedElement.focus();
  drawerTimer = window.setTimeout(() => { backdrop.hidden = true; }, 280);
}

function subscribeToSalesChanges(onRefreshError) {
  if (salesChannel) {
    salesChannel.addEventListener("message", async () => {
      try {
        await refreshServerState();
      } catch (error) {
        onRefreshError(error);
      }
    });
  }
  window.addEventListener("storage", async (event) => {
    if (event.key !== SALES_STORAGE_KEY && event.key !== null) return;
    try {
      const state = await loadState();
      updateVisibleInventory(state.inventory, state.sales);
    } catch (error) {
      onRefreshError(error);
    }
  });
}

async function initializeAdmin() {
  document.querySelector("#add-sale-item").addEventListener("click", addSaleItem);
  registerSaleButton.addEventListener("click", registerSale);
  saleProductSelect.addEventListener("change", () => {
    saleQuantityInput.max = products.find((product) => product.id === saleProductSelect.value)?.stock || 1;
  });
  saleDraftList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-sale-item]");
    if (!button) return;
    saleDraft.delete(button.dataset.removeSaleItem);
    renderSaleDraft();
  });
  salesHistory.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-sale]");
    if (button) void deleteSale(button.dataset.deleteSale);
  });
  subscribeToSalesChanges((error) => {
    setAdminStatus(`No se pudo actualizar el historial: ${error.message}`, true);
  });

  try {
    const state = await loadState();
    updateVisibleInventory(state.inventory, state.sales);
    setAdminStatus(serverBackedStorage
      ? "Inventario y ventas conectados a los archivos JSON locales."
      : "Servidor local no detectado. Las ventas solo se guardan en este navegador.");
  } catch (error) {
    products = [];
    renderInventory();
    renderSales();
    setAdminStatus(error.message, true);
  }
}

async function initializeStorefront() {
  productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (!button) return;
    const id = button.dataset.add;
    if (!addProduct(id)) return;
    const updatedButton = productGrid.querySelector(`[data-add="${id}"]`);
    updatedButton.textContent = "Agregado ✓";
    updatedButton.disabled = true;
    window.setTimeout(renderProducts, 1000);
  });

  cartList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-change]");
    if (!button) return;
    const id = button.dataset.change;
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const next = (cart.get(id) || 0) + Number(button.dataset.delta);
    if (!product.disponible || next > product.stock) return;
    if (next <= 0) cart.delete(id);
    else cart.set(id, next);
    renderCart();
  });

  openButton.addEventListener("click", openDrawer);
  closeButton.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
    if (event.key === "Tab" && drawer.classList.contains("is-open")) {
      const focusable = [...drawer.querySelectorAll("button:not(:disabled), a[href]:not([aria-disabled='true'])")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  initializeSnow();
  try {
    const state = await loadState();
    updateVisibleInventory(state.inventory, state.sales);
  } catch (error) {
    products = [];
    renderProducts();
    renderCart();
    if (storeStatus) storeStatus.textContent = `${error.message} Vuelve a cargar la página para intentarlo de nuevo.`;
  }

  subscribeToSalesChanges((error) => {
    if (storeStatus) storeStatus.textContent = `No se pudieron actualizar las existencias: ${error.message}`;
  });
}

function initializeSnow() {
  const snowCanvas = document.querySelector("#snow");
  if (!snowCanvas) return;
  const snowContext = snowCanvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let snowflakes = [];
  let snowFrame = 0;

  function resizeSnow() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    snowCanvas.width = Math.floor(window.innerWidth * pixelRatio);
    snowCanvas.height = Math.floor(window.innerHeight * pixelRatio);
    snowCanvas.style.width = `${window.innerWidth}px`;
    snowCanvas.style.height = `${window.innerHeight}px`;
    snowContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    snowflakes = Array.from({ length: 45 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 2 + 5,
      speed: Math.random() * .4 + .3,
      drift: Math.random() * .35 + .08,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() < .5 ? "red" : "green"
    }));
  }

  function drawSnowflake(flake) {
    snowContext.save();
    snowContext.translate(flake.x, flake.y);
    snowContext.rotate(flake.phase);
    snowContext.strokeStyle = flake.color === "red" ? "rgba(166,61,64,.62)" : "rgba(47,90,77,.62)";
    snowContext.lineWidth = 1.5;
    snowContext.lineCap = "round";
    for (let arm = 0; arm < 6; arm += 1) {
      snowContext.save();
      snowContext.rotate(arm * Math.PI / 3);
      snowContext.beginPath();
      snowContext.moveTo(0, 0);
      snowContext.lineTo(0, -flake.radius);
      snowContext.moveTo(0, -flake.radius * .58);
      snowContext.lineTo(-flake.radius * .27, -flake.radius * .82);
      snowContext.moveTo(0, -flake.radius * .58);
      snowContext.lineTo(flake.radius * .27, -flake.radius * .82);
      snowContext.stroke();
      snowContext.restore();
    }
    snowContext.restore();
  }

  function drawSnow() {
    if (reducedMotion.matches) return;
    snowContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    snowflakes.forEach((flake) => {
      flake.phase += .008;
      flake.y += flake.speed;
      flake.x += Math.sin(flake.phase) * flake.drift;
      if (flake.y > window.innerHeight + 8) {
        flake.y = -8;
        flake.x = Math.random() * window.innerWidth;
      }
      drawSnowflake(flake);
    });
    snowFrame = window.requestAnimationFrame(drawSnow);
  }

  function updateSnowMotion() {
    window.cancelAnimationFrame(snowFrame);
    snowContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!reducedMotion.matches) drawSnow();
  }

  resizeSnow();
  updateSnowMotion();
  window.addEventListener("resize", resizeSnow);
  window.addEventListener("resize", updateSnowMotion);
  reducedMotion.addEventListener("change", updateSnowMotion);
}

if (document.body.dataset.page === "admin") void initializeAdmin();
else initializeStorefront();
