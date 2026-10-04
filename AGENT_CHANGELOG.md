# AGENT CHANGELOG


## [Ciclo 27] - Correcciones editoriales de Use of English (#142)


### Resumen
- C1 Advanced Part 1 #1 usa `conclude that + clause` para expresar la decisión del juez con un único complemento natural.
- B2 First Part 4 #7 conserva una sola transformación correcta de cinco palabras: `prefer staying in to going`.
- Se añadieron tests de regresión para el enunciado/opciones C1 y la longitud/keyword PREFER de B2.
- Contrato y plan: `docs/specs/ciclo27-cambridge-uoe-answer-quality.md`.


### Verificación
- TDD: ambos tests nuevos fallaron antes de los cambios; tests enfocados del catálogo: 4/4.
- Suite backend: 18/23; los cinco fallos son tests con MySQL porque `127.0.0.1:3313` no estaba disponible.
- Frontend `npm run build`: correcto. No se tocaron rutas ni componentes UI.
- `node --check` y `git diff --check`: correctos.
- Review independiente: aprobado; la unicidad C1 se confirma editorialmente y la respuesta B2 completa el enunciado con cinco palabras.


### Estado
- Issue #142 enlazado desde la PR #146 en `agent/fix-cambridge-uoe-editorial`; CI `backend-test` y `frontend-build` verdes.
- Follow-up #143: respuestas de una palabra en B1 Part 4 #3 y #5.


## [Ciclo 13] - Desglose correcto de respuestas en el historial (#111)

### Resumen
- Normaliza valores escalares como una única respuesta para `marked_answers` y `feedback_summary`.
- Mantiene el orden y la comparación existentes en las respuestas multiparte.
- Extrae el formateo a `attempt-feedback.js` para reutilizarlo en el endpoint y probarlo de forma aislada.

### Verificación
- TDD: tests rojos con helper ausente; 4 tests focalizados pasan tras el fix.
- Backend completo: 20/20 en MySQL temporal; frontend build y `git diff --check`: OK.
- El test del controlador confirma que `GET /api/attempts/:id` devuelve una sola marca correcta para una respuesta escalar.

### Estado
- Issue #111 enlazado a la PR #113, abierta desde `agent/fix-scalar-attempt-feedback`.
- Spec: `docs/specs/ciclo13-scalar-attempt-feedback.md`.
## [Ciclo 11] - Editar meta diaria desde Dashboard (#108)


### Resumen
- La tarjeta de meta diaria permite ajustar de 1 a 100 ejercicios y actualiza el progreso tras confirmar el servidor.
- Los errores de validación, red o servidor conservan la última meta confirmada y anuncian el estado con feedback accesible.
- Las personas visitantes ven el acceso al inicio de sesión en vez de un control que no podrían guardar.


### Verificación
- `frontend npm test`: 2/2.
- `frontend npm run build`: OK; `npx eslint src/pages/Dashboard.tsx`: OK; `git diff --check`: OK.
- QA UI: `/learn` cargó como visitante y mostró la meta, el progreso y el enlace de inicio de sesión.
- El guardado autenticado requiere backend y sesión; no se verificó en navegador en esta sesión.


### Estado
- Issue #108 enlazado a la PR #109, abierta con la etiqueta `needs-human-review`.
- Spec: `docs/specs/ciclo11-daily-goal-settings.md`.
## [Ciclo 18] - Clasificación global coherente con el API (#122)


### Resumen
- La vista de ranking ahora refleja la clasificación global por monedas y la racha como desempate; elimina la liga, los ascensos, la cuenta atrás y la etiqueta XP que no respaldaba el backend.
- Normaliza la respuesta paginada `{ data, meta }`, muestra monedas y distingue carga, vacío, error y reintento.
- Añade `node:test` frontend sin dependencias nuevas y un gotcha accionable en `AGENTS.md`.


### Verificación
- Frontend: 3/3 tests y build OK; smoke visual local con ranking poblado, vacío y error visible.
- `git diff --check` OK. `npm run lint` sigue con 15 errores en otras pantallas/componentes, registrados en #98/PR #102; esta pantalla ya no aporta el `any` que causaba uno de los errores.
- Primer test rojo esperado antes de crear el normalizador: módulo aún inexistente.


### Estado
- Issue #122 enlazado desde la PR #123 (`agent/feat-accurate-global-ranking`); PR abierta y checks `backend-test` + `frontend-build` verdes.
## [Ciclo 10] - Aplicar racha al cumplir la meta diaria (#106)


### Resumen
La racha solo avanza cuando el número de intentos persistidos del día UTC alcanza `daily_goal`. Los intentos por debajo de la meta conservan la racha y fecha anterior; los intentos siguientes no vuelven a incrementarla. Se eliminó el helper de controlador que no tenía callers.


### Verificación
- TDD: el test de umbral falló antes del cambio (`3 !== 2`) y pasó después.
- `backend npm test`: 18/18 con MySQL temporal en `127.0.0.1:3313`, migraciones aplicadas.
- `frontend npm run build`: correcto.
