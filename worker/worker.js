const PRODUCT_IDS = new Set([
  "pino",
  "copo",
  "estrella",
  "baston",
  "lunares",
  "muneco",
  "cuadros",
  "bola"
]);

function responseJson(request, env, body, status = 200) {
  const origin = request.headers.get("Origin");
  const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",").map((value) => value.trim());
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  });
  if (origin && allowedOrigins.includes(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}

function secureEqual(leftValue, rightValue) {
  const encoder = new TextEncoder();
  const left = encoder.encode(String(leftValue || ""));
  const right = encoder.encode(String(rightValue || ""));
  if (left.length !== right.length || left.length === 0) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

function githubHeaders(env) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "navidad-en-cojines-inventory-worker"
  };
}

function inventoryUrl(env, includeRef = true) {
  const url = new URL(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/inventory.json`);
  if (includeRef) url.searchParams.set("ref", env.GITHUB_BRANCH || "main");
  return url;
}

async function readInventory(env) {
  const response = await fetch(inventoryUrl(env), { headers: githubHeaders(env) });
  if (!response.ok) throw new Error(`GitHub no pudo leer el inventario (${response.status}).`);
  const file = await response.json();
  const decoded = Uint8Array.from(atob(file.content.replace(/\s/g, "")), (character) => character.charCodeAt(0));
  return { inventory: JSON.parse(new TextDecoder().decode(decoded)), sha: file.sha };
}

function encodeContent(value) {
  const bytes = new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function writeInventory(env, productId, action, stock, delta) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readInventory(env);
    const next = { ...current.inventory };
    if (action === "delete") {
      if (next[productId] !== 0) throw new Error("Solo se puede eliminar una referencia con stock en cero.");
      delete next[productId];
    } else if (action === "adjust") {
      const adjustedStock = next[productId] + delta;
      if (!Number.isInteger(next[productId]) || adjustedStock < 0 || adjustedStock > 10000) {
        throw new Error("El ajuste dejaría el inventario fuera del rango permitido.");
      }
      next[productId] = adjustedStock;
    } else {
      next[productId] = stock;
    }

    const response = await fetch(inventoryUrl(env, false), {
      method: "PUT",
      headers: { ...githubHeaders(env), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: action === "delete" ? `Eliminar ${productId} agotado` : `Actualizar stock de ${productId}: ${next[productId]} ${next[productId] === 1 ? "unidad" : "unidades"}`,
        content: encodeContent(next),
        sha: current.sha,
        branch: env.GITHUB_BRANCH || "main"
      })
    });
    if (response.ok) return next;
    const detail = await response.text();
    if (response.status !== 409 && response.status !== 422) {
      throw new Error(`GitHub rechazó el cambio (${response.status}): ${detail}`);
    }
  }
  throw new Error("El inventario cambió a la vez desde otro lugar. Vuelve a intentarlo.");
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return responseJson(request, env, {}, 200);
    const url = new URL(request.url);
    if (url.pathname === "/inventory" && request.method === "GET") {
      try {
        const { inventory } = await readInventory(env);
        return responseJson(request, env, inventory);
      } catch (error) {
        return responseJson(request, env, { error: error.message }, 502);
      }
    }
    if (request.method !== "POST" || !["/auth", "/inventory"].includes(url.pathname)) {
      return responseJson(request, env, { error: "Ruta no encontrada." }, 404);
    }

    const body = await readBody(request);
    if (!body || !secureEqual(body.password, env.ADMIN_PASSWORD)) {
      return responseJson(request, env, { error: "Clave de administrador incorrecta." }, 401);
    }
    if (url.pathname === "/auth") return responseJson(request, env, { ok: true });

    const { productId, action, stock } = body;
    if (!PRODUCT_IDS.has(productId) || !["adjust", "set", "delete"].includes(action)) {
      return responseJson(request, env, { error: "Referencia o acción no válida." }, 400);
    }
    if (action === "adjust" && (!Number.isInteger(body.delta) || Math.abs(body.delta) !== 1)) {
      return responseJson(request, env, { error: "El ajuste debe ser de una unidad." }, 400);
    }
    if (action === "set" && (!Number.isInteger(stock) || stock < 0 || stock > 10000)) {
      return responseJson(request, env, { error: "El stock debe ser un entero entre 0 y 10000." }, 400);
    }
    try {
      const inventory = await writeInventory(env, productId, action, stock, body.delta);
      return responseJson(request, env, { inventory });
    } catch (error) {
      return responseJson(request, env, { error: error.message }, 502);
    }
  }
};
