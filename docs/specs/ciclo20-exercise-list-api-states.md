# Ciclo 20: estados de la lista de ejercicios

Issue: #126

Rama: `agent/fix-exercises-list-api-state`

## Problema y alcance

`/categories/:subcategoryId/exercises` interpreta errores HTTP/red como listas vacías. La API actual devuelve `{ exercises, ... }`; una avería se presenta como si no hubiera contenido y no se puede reintentar. Este ciclo separa ambos estados sin cambiar el endpoint ni la paginación.

## Criterios de aceptación

- **AC-001**: Una respuesta válida `{ exercises: [] }` muestra el estado vacío actual.
- **AC-002**: Errores HTTP, de red o payload inválido muestran error y un reintento disponible.
- **AC-003**: La carga es accesible y una petición obsoleta no actualiza la ruta tras cambiar de nivel/subcategoría.
- **AC-004**: Tests `node:test` sin dependencias nuevas cubren la respuesta real, vacío e inválido; CI ejecuta tests y build.
- **AC-005**: Smoke visual confirma estados poblado, vacío y error.

## Invariantes

- **INV-001**: No cambian endpoint, paginación ni filtros.
- **INV-002**: Las tarjetas conservan las rutas y el contenido de API existente.
- **INV-003**: No se convierten fallos de red en mensajes que afirmen que no existe contenido.

## Plan

- [x] Añadir primero tests rojos para normalizar `{ exercises, ... }`, vacío e inválido.
- [x] Separar carga, éxito vacío, éxito con datos y error; cancelar escrituras obsoletas y permitir reintento.
- [x] Ejecutar tests frontend, lint dirigido, build y smoke de la ruta.
- [x] Actualizar changelog, subir commits semánticos y abrir la PR #127 que cierra #126.
