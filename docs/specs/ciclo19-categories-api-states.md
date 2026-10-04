# Ciclo 19: estados de la pantalla de categorías

Issue: #124

Rama: `agent/fix-categories-api-states`

## Problema y alcance

`/categories` empieza con subcategorías estáticas y silencia errores del API. Una respuesta vacía o fallida deja visibles enlaces de demostración que no corresponden al catálogo persistido. Este ciclo hace que la pantalla dependa solo de `/api/categories` y comunique carga, vacío y error.

## Criterios de aceptación

- **AC-001**: La página solo muestra categorías recibidas y normalizadas desde la API; no incluye fallback estático.
- **AC-002**: Oculta subcategorías con `totalItems <= 0` y categorías que se queden sin subcategorías.
- **AC-003**: Diferencia carga, catálogo vacío válido y error HTTP/red; el error permite reintentar.
- **AC-004**: Tests integrados en CI cubren catálogo poblado, nodos vacíos y payload no válido, sin nuevas dependencias.
- **AC-005**: Build frontend pasa y QA confirma que no hay enlaces demo en estados vacío/error.

## Invariantes

- **INV-001**: No cambian el endpoint, el catálogo ni los ejercicios.
- **INV-002**: Se conservan las rutas de las categorías y subcategorías reales.
- **INV-003**: Se mantiene la identidad visual de Ceferly.

## Plan

- [x] Añadir primero tests rojos de normalización para el payload real del backend.
- [x] Eliminar `FALLBACK_CATEGORIES` e implementar los estados de carga, vacío, error y reintento.
- [x] Ejecutar tests frontend, lint dirigido, build y smoke de la ruta.
- [x] Actualizar el changelog, subir commits semánticos y abrir la PR #125 que cierra #124.
