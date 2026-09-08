# Ciclo 3 — Catálogo sin rutas vacías

Issue: #92
Rama: `agent/fix-empty-catalog-nodes`

## Spec
`GET /api/categories` devuelve solo categorías con al menos una subcategoría que tenga ejercicios (`totalItems > 0`). Cada subcategoría incluye `totalItems`.

`/learn` y `/categories` no enlazan a listas vacías.

## Tests
`backend/test/catalog.service.test.js` llama a `attachCountsAndDropEmpty` (función enviada).
