# Conectar el inventario con GitHub Pages

El Worker mantiene el token de GitHub fuera del navegador. El panel solo recibe la clave de administrador, que se verifica en el Worker.

## Requisitos

- Una cuenta de Cloudflare con Workers habilitado.
- Un token fine-grained de GitHub limitado al repositorio `lunarm24/Navidad-en-cojines`, con permiso `Contents: Read and write`.
- Una clave de administrador larga que no reutilices en otros servicios.

## Cloudflare Dashboard

1. En Cloudflare, abre **Workers & Pages**, crea un Worker y elige **Edit code**.
2. Reemplaza el ejemplo por el contenido de `worker/worker.js` y pulsa **Deploy**.
3. En los ajustes del Worker, agrega estas variables de texto:

	- `GITHUB_OWNER`: `lunarm24`
	- `GITHUB_REPO`: `Navidad-en-cojines`
	- `GITHUB_BRANCH`: `main`
	- `ALLOWED_ORIGINS`: `https://lunarm24.github.io,http://localhost:8080`

4. En **Secrets**, crea `GITHUB_TOKEN` con el token fine-grained y `ADMIN_PASSWORD` con tu clave privada. No los pongas en archivos del repo ni en el JavaScript del sitio.
5. Copia la URL `.workers.dev` que muestra Cloudflare y ponla, sin barra final, en `config.js`:

```js
window.NAVIDAD_INVENTORY_API = "https://nombre-del-worker.usuario.workers.dev";
```

También puedes desplegar el Worker con Wrangler si tienes Node.js y npm:

```powershell
npx wrangler@latest login
npx wrangler@latest secret put GITHUB_TOKEN --config worker/wrangler.toml
npx wrangler@latest secret put ADMIN_PASSWORD --config worker/wrangler.toml
npx wrangler@latest deploy --config worker/wrangler.toml
```

Escribe los secretos directamente en la terminal cuando Wrangler los solicite.

## GitHub Pages

En GitHub abre **Settings > Pages** y selecciona **GitHub Actions** como fuente. Esta página aún no aparece habilitada en el repo. Luego sube los archivos de este proyecto a `main`; el workflow `.github/workflows/pages.yml` publicará el sitio.

El Worker crea un commit en `inventory.json` al cambiar el stock. Ese push vuelve a ejecutar el workflow de Pages. El sitio también consulta el Worker para mostrar existencias actuales mientras Pages termina de desplegar. El workflow publica solo archivos de tienda; no publica el código ni la configuración del Worker.

La tienda queda en `https://lunarm24.github.io/Navidad-en-cojines/` y el panel en `https://lunarm24.github.io/Navidad-en-cojines/admin/`. También se conserva la página de origen `admin.html`. La clave de administrador se escribe en el panel y se mantiene solo en memoria durante esa sesión.
