# AGENT CHANGELOG

## [Ciclo 6] - Claves de respuesta ocultas hasta el intento (#97)

### Resumen
Las rutas GET de ejercicios ya no serializan `correct_answer` ni `correctAnswer`. El reproductor usa el scoring autenticado del servidor y muestra la solución tras guardar el intento; a visitantes sin sesión les ofrece iniciar sesión.

### Verificación
- Backend: suite completa 19/19; regresiones para listado, detalle y ejercicio aleatorio.
- Frontend: `npm run build` y ESLint focalizado de `ExercisePlayer.tsx` OK.
- API real: list/detail/random respondieron 200 sin claves; el POST sin sesión respondió 401.
- QA UI: invitado recibe el enlace de acceso sin ver solución; sesión autenticada ve la solución tras enviar, conserva vidas/racha y llega a `/results`; consola del navegador sin errores.
- El lint completo conserva errores previos en archivos fuera del cambio; seguimiento existente en issue #98.

### Estado
- Issue #97 enlazado desde PR #100; checks de backend y frontend verdes. PR abierta con `needs-human-review` porque comprobar una respuesta ahora requiere sesión.
- No se hicieron cambios de esquema. La corrección previa de README Angular → React quedó integrada en `main` mediante PR #96.
## [Ciclo 16] - Alinear retornos de Stripe con rutas React (#117)

### Resumen
- Las sesiones Pro y Premium ahora comparten un constructor puro que devuelve `/payment/success?session_id={CHECKOUT_SESSION_ID}` y `/payment/cancel`, rutas existentes en React.
- Se añadieron tests unitarios de retorno sin importar ni llamar al SDK de Stripe; el cancel page no hace requests ni modifica el usuario.
- Se documentó alcance e invariantes en `docs/specs/ciclo16-stripe-return-urls.md`.

### Verificación
- Test nuevo: 2/2; suite backend: 18/18 contra MySQL temporal con migraciones aplicadas.
- Frontend: `npm run build` OK; `git diff --check` OK.
- La primera suite completa corrió antes de aplicar migraciones y falló porque faltaba `levels`; repetida tras migrar, pasó íntegra.
- Revisión manual: rutas y `session_id` coinciden en el helper y `App.tsx`; `PaymentCancel` no llama al backend.

### Estado
- Issue #117 enlazado desde la PR #119 en `agent/fix-stripe-return-urls`; PR abierta para revisión.
## [Ciclo 19] - Estados reales para la pantalla de categorías (#124)

### Resumen
- Se eliminó `FALLBACK_CATEGORIES`; `/categories` ahora renderiza únicamente el catálogo real recibido del API.
- Se filtran subcategorías y categorías sin ejercicios y se distinguen carga, vacío válido, error HTTP/red y reintento.
- Se añadieron pruebas `node:test` frontend sin dependencias nuevas y una regla breve para no reintroducir nodos demo.

### Verificación
- Frontend: 3/3 tests y build OK; lint dirigido a los archivos cambiados OK.
- Smoke local con datos ficticios efímeros: catálogo poblado, respuesta vacía y API no disponible; ningún estado vacío/error mostró enlaces demo.
- El lint completo sigue fallando con 16 errores y 1 warning en otros archivos, ya cubiertos por #98/PR #102.
- El primer test rojo falló porque `categoriesData.mjs` aún no existía, como esperaba TDD.

### Estado
- Issue #124 enlazado desde la PR #125 (`agent/fix-categories-api-states`); PR abierta y checks `backend-test` + `frontend-build` verdes.
## [Ciclo 20] - Estados de error para la lista de ejercicios (#126)

### Resumen
- La lista usa el contrato `{ exercises, ... }`, conserva el vacío válido y distingue errores HTTP/red con reintento.
- Ignora resultados obsoletos al cambiar nivel/subcategoría y limita cada fila a los campos que la vista necesita.
- Añade tests `node:test` frontend sin dependencias y la ejecución en CI.

### Verificación
- Frontend: 3/3 tests y build OK; lint dirigido a los archivos cambiados OK.
- Smoke local con datos ficticios efímeros: lista poblada, vacío válido y error de API con reintento visible.
- El lint completo sigue fallando con 16 errores y 1 warning en otras rutas, cubiertos por #98/PR #102.
- El primer test rojo falló porque `exercisesData.mjs` aún no existía, como esperaba TDD.

### Estado
- Issue #126 enlazado desde la PR #127 (`agent/fix-exercises-list-api-state`); PR abierta y checks `backend-test` + `frontend-build` verdes.
## [Ciclo 21] - Resultado vacío sin contexto (#128)

### Resumen
- `/results` valida el estado de navegación antes de mostrar resultado, precisión, recompensas o explicación IA; una ruta directa ofrece volver a aprender o ver categorías.
- Las recompensas se etiquetan como monedas, según el valor real recibido.
- Se añadieron tests `node:test` frontend sin dependencias y la ejecución en CI.

### Verificación
- Frontend: 2/2 tests y build OK; lint dirigido a la página y el helper OK.
- Smoke visual de `/results` sin estado: mensaje “No hay un resultado disponible” y accesos de navegación, sin éxito ni explicación IA.
- El lint completo sigue fallando con 16 errores y 1 warning en otros archivos, cubiertos por #98/PR #102.
- El test rojo inicial confirmó que el validador aún no existía.

### Estado
- Issue #128 enlazado desde la PR #129 (`agent/fix-results-empty-state`); PR abierta y checks `backend-test` + `frontend-build` verdes.
## [Ciclo 22] - Progreso real en el Dashboard (#130)

### Resumen
- El camino de aprendizaje se carga solo desde subcategorías con `totalItems > 0`; ya no conserva demos ni asigna estrellas o estados completados sin datos de progreso.
- Se añadieron estados de carga, catálogo vacío, error y reintento; el ranking del Dashboard ahora enlaza a la clasificación global por monedas y se retiró el 84% no respaldado.
- La meta diaria, las reglas de racha y el backend quedan fuera de alcance. Contrato y plan: `docs/specs/ciclo22-dashboard-real-progress.md`.

### Verificación local
- TDD: el test del normalizador falló antes de implementarlo; `npm test` pasa 3/3 y `npm run build` pasa.
- Lint dirigido pasa. El lint completo conserva 14 errores y 1 aviso en otros archivos.
- Smoke UI local: catálogo poblado/vacío, error con reintento y carga; se verificó que solo se enlazan módulos poblados y no aparecen estrellas, liga, puesto ni porcentaje inventados.
- CI de la PR #131: `backend-test` y `frontend-build` verdes en `push` y `pull_request`.

### Estado
- Issue #130 enlazado por la PR #131, abierta con checks verdes en `agent/fix-dashboard-real-progress`.

## [Ciclo 4] - Documentación alineada con React y Vite (#95)

### Resumen
Los README describen ahora el frontend implementado con React 19, TypeScript, Vite y Tailwind CSS. Se actualizaron sus rutas, comandos y configuración de API; `GOAL_PROMPT.md` pide mantener la documentación en sincronía con el código.

### Verificación
- Stack y scripts contrastados con `frontend/package.json` y `frontend/vite.config.ts`.
- Rutas contrastadas con `frontend/src/App.tsx`.
- No se ejecutaron tests: el cambio solo modifica documentación.

### Estado
- Issue #95 enlazado desde la PR #96; `backend-test` y `frontend-build` pasaron.

## [Ciclo 3] - Catálogo sin subcategorías vacías (#92)

### Resumen
`GET /api/categories` omite subcategorías con 0 ejercicios. `/learn` y `/categories` ya no enlazan a listas en blanco (Tenses, Passive Voice, Listening).

### Verificación
- Tests: `attachCountsAndDropEmpty` + suite completa 16/16.
- Live `GET /api/categories`: Grammar/Reading/Use of English/Vocabulary/Writing; ningún `totalItems === 0`.
- Frontend build OK.

### Siguiente prioridad
Writing con corrección semántica por IA, o Listening con audio.

## [Ciclo 2] - Cambridge B1/B2/C1 Use of English, vidas persistidas y CI

### Resumen del Ciclo
Se cubrió la barra del MVP: 108 ejercicios originales de Use of English (Parts 1–4) para B1 Preliminary, B2 First y C1 Advanced con `explanation_rule`; el player ya no se queda en DEMO; los intentos persisten con scoring de servidor; las explicaciones de IA se guardan en `AttemptExplanation` (con cliente LLM inyectable); corazones, racha y monedas viven en el usuario; la tienda gasta precios de servidor; CI ejecuta `npm test` + build frontend.

### Cambios Realizados
- Catálogo Cambridge (`backend/src/cambridge/`) y seeder `seedCambridgeUseOfEnglish`.
- Columnas `exercises.explanation_rule`, `exercises.content`, `users.hearts`.
- Servicios enviados: `gamification`, `scoring`, `attempt`, `explanation`, `shop`.
- `POST /exercises/:id/attempt` puntúa en servidor, descuenta vidas al fallar y bloquea con 0 corazones.
- `POST /attempts/:id/explain` persiste explicación (LLM o regla pedagógica de fallback).
- `GET /api/levels`, ranking por monedas, `POST /users/me/shop`.
- UI: player sin DEMO, header/shop/learn leen racha/monedas/vidas reales, recarga de vidas, verde `#58CC02`.
- Runner `node --test` (12 tests) y `.github/workflows/ci.yml`.
- Seeder legado deja de duplicar filas (`findOrCreate` por `title`).

### Estado actual
- API `:4000` y UI `:4200` arriba.
- Conteos con `explanation_rule`: B1 36 catálogo (+fixtures de test), B2 36, C1 36. Parts 1–4 cubiertas.
- E2E verificado: register → levels → categories → exercise → attempt (hearts 5→4) → explain persistido → shop heart-refill.

### Verificación
- `backend npm test` 12/12, dos corridas.
- `frontend npm run build` exit 0.
- CI local: tests + build OK.

### Siguiente prioridad
C2 Proficiency (Use of English) o Writing con corrección semántica por IA; Listening sigue sin audio.
