# Ciclo 18: clasificación global fiel a la API

Issue: #122

Rama: `agent/feat-accurate-global-ranking`

## Problema y alcance

`GET /users/rankings?type=coins` devuelve `{ data, meta }` con usuarios ordenados por monedas y racha. La vista actual afirma que existe una liga semanal con ascensos y cuenta atrás, y etiqueta las monedas como XP. Este ciclo alinea la interfaz con el contrato real y distingue carga, vacío y error.

## Criterios de aceptación

- **AC-001**: La cabecera describe una clasificación global por monedas; aclara que la racha desempata.
- **AC-002**: No aparecen divisiones, ascensos ni fechas que la API no proporciona.
- **AC-003**: Las filas muestran monedas, conservan la racha como dato secundario y normalizan el objeto `{ data, meta }`.
- **AC-004**: La interfaz diferencia carga, respuesta vacía y error; un fallo permite reintentar.
- **AC-005**: La normalización tiene pruebas con `node:test` integrado, sin dependencias nuevas; CI ejecuta `npm test` y el build frontend pasa.

## Invariantes

- **INV-001**: No cambia el criterio del backend ni los datos expuestos por el endpoint.
- **INV-002**: No se presentan ligas, periodos ni recompensas que no estén implementados.
- **INV-003**: Se conserva la identidad visual actual de Ceferly.

## Plan

- [x] Añadir pruebas rojas de normalización para el payload paginado real y valores alternativos de puntuación.
- [x] Implementar un normalizador pequeño y reutilizable sin añadir dependencias.
- [x] Sustituir las afirmaciones ficticias y añadir estados de carga, vacío, error y reintento.
- [x] Ejecutar pruebas frontend, lint y build; revisar la vista y el diff.
- [x] Actualizar el changelog, subir commits semánticos y abrir la PR #123 que cierra #122.
