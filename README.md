# Navidad en cojines

Tienda estática publicada en GitHub Pages. El inventario se mantiene manualmente en `inventory.json`.

## Actualizar existencias

1. Abre `/admin` y pulsa **Editar inventario en GitHub**, o edita `inventory.json` directamente en la rama `main`.
2. Cambia solo la cantidad de la referencia. Por ejemplo, usa `"pino": 0` para marcar el Árbol de pino como agotado.
3. Guarda el cambio en GitHub. El workflow publicará la actualización en Pages.

La tienda deriva `disponible` automáticamente: si la cantidad es mayor que cero, vale `true`; si es cero, vale `false` y el producto aparece como **Agotado**. No hace falta editar un segundo campo.

La tienda está en `https://lunarm24.github.io/Navidad-en-cojines/` y la consulta de existencias en `https://lunarm24.github.io/Navidad-en-cojines/admin`.
