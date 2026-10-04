/* Productos */
const PHONE = "573217096231";
const INVENTORY_API = String(window.NAVIDAD_INVENTORY_API || "").replace(/\/+$/, "");
const INVENTORY_FILE = new URL("inventory.json", document.querySelector('script[src$="script.js"]').src).href;
const defaultProducts = [
  { id: "pino", name: "Árbol de pino", description: "Un clásico verde para llenar de calma cada rincón.", motif: "tree", fabric: "#e8eee5", ink: "#315a48", accent: "#b8544d" },
  { id: "copo", name: "Copo de nieve", description: "Copos delicados sobre una noche de invierno.", motif: "snowflake", fabric: "#e7edf0", ink: "#597887", accent: "#fffdf9" },
  { id: "estrella", name: "Estrella dorada", description: "Un brillo sereno para las noches especiales.", motif: "star", fabric: "#eee6d5", ink: "#b58b39", accent: "#fffdf9" },
  { id: "baston", name: "Bastón de caramelo", description: "Rayas festivas con un toque dulce y tradicional.", motif: "candy", fabric: "#f2e5df", ink: "#a63d40", accent: "#fffdf9" },
  { id: "lunares", name: "Lunares de invierno", description: "Puntitos de nieve en una tela suave y luminosa.", motif: "dots", fabric: "#e7e9e0", ink: "#64786a", accent: "#fffdf9" },
  { id: "muneco", name: "Muñeco de nieve", description: "Una sonrisa tierna que encanta a toda la familia.", motif: "snowman", fabric: "#e8edf0", ink: "#536a71", accent: "#b8544d" },
  { id: "cuadros", name: "Cuadros de cabaña", description: "El encanto cálido de una tarde junto al fuego.", motif: "plaid", fabric: "#eee2dc", ink: "#8c4944", accent: "#e1c6b1" },
  { id: "bola", name: "Bola de Navidad", description: "Un adorno clásico para vestir tu sofá de fiesta.", motif: "ornament", fabric: "#e9e7d8", ink: "#69774d", accent: "#c4a052" }
];
let products = [];
let adminPassword = "";
let inventorySaving = false;
const inventoryChannel = "BroadcastChannel" in window ? new BroadcastChannel("navidad-en-cojines-inventory") : null;

async function loadInventory() {
  const url = INVENTORY_API ? `${INVENTORY_API}/inventory` : `${INVENTORY_FILE}?v=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar el inventario (${response.status}).`);
  const inventory = await response.json();
  if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) {
    throw new Error("El archivo de inventario no tiene un formato válido.");
  }
  return inventory;
}

function productsFromInventory(inventory) {
  return defaultProducts.flatMap((product) => {
    if (!Object.prototype.hasOwnProperty.call(inventory, product.id)) return [];
    const stock = inventory[product.id];
    if (!Number.isInteger(stock) || stock < 0) return [];
    return [{ ...product, stock }];
  });
}

async function loadProducts() {
  return productsFromInventory(await loadInventory());
}

/* Ilustraciones SVG reemplazables por fotografías usando product.image. */
function cushionSvg(product) {
  if (product.image) {
    return `<img class="product-art" src="${product.image}" alt="Cojín ${product.name}" loading="lazy">`;
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
const adminAuth = document.querySelector("#admin-auth");
const adminStatus = document.querySelector("#admin-status");
const storeStatus = document.querySelector("#store-status");
let lastFocusedElement = null;
let drawerTimer;

function formatPrice(value) {
  return `$${money.format(value)}`;
}

function updateVisibleInventory(inventory) {
  products = productsFromInventory(inventory);
  for (const [id, quantity] of cart) {
    const product = products.find((item) => item.id === id);
    if (!product || product.stock === 0) cart.delete(id);
    else if (quantity > product.stock) cart.set(id, product.stock);
  }
  if (productGrid) renderProducts();
  if (cartList) renderCart();
  if (inventoryList) renderInventory();
}

async function sendInventoryChange(change) {
  if (!INVENTORY_API || !adminPassword) throw new Error("Configura y conecta el servicio de inventario primero.");
  const response = await fetch(`${INVENTORY_API}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...change, password: adminPassword })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "No se pudo guardar el cambio.");
  return result.inventory;
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

function cartQuantity() {
  return [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
}

function renderProducts() {
  productGrid.innerHTML = products.length ? products.map((product) => `
    <article class="product-card">
      ${cushionSvg(product)}
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Agregar ${product.name} al pedido" ${product.stock <= (cart.get(product.id) || 0) ? "disabled" : ""}>${product.stock === 0 ? "Agotado" : product.stock <= (cart.get(product.id) || 0) ? "Máximo en el pedido" : "Agregar al pedido"}</button>
      </div>
    </article>`).join("") : `<p class="inventory-empty">No hay cojines disponibles en este momento.</p>`;
  const heroProducts = ["muneco", "pino", "cuadros"].map((id) => products.find((product) => product.id === id) || products[0]).filter(Boolean);
  document.querySelectorAll("#hero-art .hero-pillow").forEach((pillow, index) => {
    const product = heroProducts[index];
    pillow.hidden = !product;
    pillow.innerHTML = product ? cushionSvg(product) : "";
  });
}

function renderInventory() {
  if (products.length === 0) {
    inventoryList.innerHTML = `<p class="inventory-empty">No quedan referencias en el catálogo.</p>`;
    return;
  }
  inventoryList.innerHTML = products.map((product) => `
    <div class="inventory-row">
      <div class="inventory-product">
        ${cushionSvg(product)}
        <strong>${product.name}</strong>
      </div>
      <div class="inventory-controls" aria-label="Inventario de ${product.name}">
        <button class="quantity-button" type="button" data-stock="${product.id}" data-delta="-1" aria-label="Restar una unidad de ${product.name}" ${product.stock === 0 || !adminPassword || inventorySaving ? "disabled" : ""}>−</button>
        <span class="inventory-quantity">${product.stock} ${product.stock === 1 ? "unidad" : "unidades"}</span>
        <button class="quantity-button" type="button" data-stock="${product.id}" data-delta="1" aria-label="Sumar una unidad de ${product.name}" ${!adminPassword || inventorySaving ? "disabled" : ""}>+</button>
      </div>
      <button class="inventory-delete" type="button" data-delete="${product.id}" ${product.stock > 0 || !adminPassword || inventorySaving ? "disabled" : ""}>Eliminar</button>
    </div>`).join("");
}

function buildWhatsAppUrl() {
  const lines = products
    .filter((product) => cart.has(product.id))
    .map((product) => `• ${cart.get(product.id)} x ${product.name}`);
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
  if (!product || (cart.get(id) || 0) >= product.stock) return false;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  renderProducts();
  return true;
}

async function updateStock(id, delta) {
  const product = products.find((item) => item.id === id);
  if (!product || inventorySaving || product.stock + delta < 0) return;
  inventorySaving = true;
  renderInventory();
  setAdminStatus("Guardando cambio en GitHub...");
  try {
    const inventory = await sendInventoryChange({ productId: id, action: "adjust", delta });
    updateVisibleInventory(inventory);
    inventoryChannel?.postMessage(inventory);
    setAdminStatus("Cambio guardado en el repositorio. GitHub Pages se actualizará al terminar el despliegue.");
  } catch (error) {
    setAdminStatus(error.message, true);
  } finally {
    inventorySaving = false;
    renderInventory();
  }
}

async function deleteProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product || product.stock !== 0 || inventorySaving) return;
  inventorySaving = true;
  renderInventory();
  setAdminStatus("Eliminando referencia del repositorio...");
  try {
    const inventory = await sendInventoryChange({ productId: id, action: "delete" });
    updateVisibleInventory(inventory);
    inventoryChannel?.postMessage(inventory);
    setAdminStatus("Referencia eliminada del repositorio. GitHub Pages se actualizará al terminar el despliegue.");
  } catch (error) {
    setAdminStatus(error.message, true);
  } finally {
    inventorySaving = false;
    renderInventory();
  }
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

async function initializeAdmin() {
  inventoryList.addEventListener("click", (event) => {
    const stockButton = event.target.closest("[data-stock]");
    if (stockButton) {
      void updateStock(stockButton.dataset.stock, Number(stockButton.dataset.delta));
      return;
    }
    const deleteButton = event.target.closest("[data-delete]");
    if (deleteButton) void deleteProduct(deleteButton.dataset.delete);
  });

  adminAuth.addEventListener("submit", async (event) => {
    event.preventDefault();
    const passwordInput = adminAuth.querySelector("#admin-password");
    const password = passwordInput.value;
    const button = adminAuth.querySelector("button[type='submit']");
    if (!INVENTORY_API) {
      setAdminStatus("Configura y despliega el Worker para guardar cambios compartidos.", true);
      return;
    }
    button.disabled = true;
    setAdminStatus("Verificando acceso...");
    try {
      const response = await fetch(`${INVENTORY_API}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo verificar la clave.");
      adminPassword = password;
      passwordInput.value = "";
      renderInventory();
      setAdminStatus("Conectado. Los cambios se guardarán en GitHub.");
    } catch (error) {
      setAdminStatus(error.message, true);
    } finally {
      button.disabled = false;
    }
  });

  adminAuth.querySelector("button[type='submit']").disabled = !INVENTORY_API;
  if (!INVENTORY_API) {
    setAdminStatus("El Worker no está configurado; aquí solo puedes consultar el inventario.", true);
  }
  try {
    products = await loadProducts();
  } catch (error) {
    setAdminStatus(error.message, true);
  }
  renderInventory();
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
    if (next > product.stock) return;
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
    updateVisibleInventory(await loadInventory());
  } catch (error) {
    updateVisibleInventory({});
    if (storeStatus) storeStatus.textContent = `${error.message} Vuelve a cargar la página para intentarlo de nuevo.`;
  }
  if (INVENTORY_API) {
    window.setInterval(() => { void refreshStoreInventory(); }, 60000);
    window.addEventListener("focus", () => { void refreshStoreInventory(); });
  }
}

async function refreshStoreInventory() {
  try {
    updateVisibleInventory(await loadInventory());
    if (storeStatus) storeStatus.textContent = "";
  } catch (error) {
    if (storeStatus) storeStatus.textContent = error.message;
  }
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

inventoryChannel?.addEventListener("message", (event) => {
  updateVisibleInventory(event.data);
});
