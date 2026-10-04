# AGENT CHANGELOG

## [Ciclo 29] - Aplicar el límite de palabras a B1 Part 4 (#143)

### Resumen
- Corregir B1 Part 4 #3 y #5: cada respuesta aceptada tiene entre 2 y 5 palabras y conserva la keyword.
- En #5, usar una transformación pasiva natural de cuatro palabras con BECAUSE.
- Contrato y plan: `docs/specs/ciclo29-b1-part4-word-limit.md`.

### Estado
- Implementación y regresiones completadas en `agent/fix-b1-part4-word-limit`; issue #143 reutilizado.
- TDD: la prueba falló primero por `interests` y `because` de una palabra; tras corregir el catálogo, la suite backend pasa 23/23 y el build frontend pasa.
- QA detectó que el seeder no reconcilia filas ya persistidas; follow-up #147 abierto para actualizar contenido existente de forma segura.

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
- Tests cubren intentos bajo la meta, alcanzar meta, intentos extra, continuidad al día siguiente y reinicio tras un día omitido.

### Estado
- Issue #106 enlazado desde la PR #107, abierta y marcada `needs-human-review`; `backend-test` y `frontend-build` pasaron para el commit `e2c3800`.
- Spec: `docs/specs/ciclo10-streak-daily-goal.md`.

## Retrospectiva — ciclos 6–10

- Las recompensas y el scoring deben conservar al servidor como fuente de verdad; el Header solo proyecta la respuesta persistida.
- Auth y datos persistidos llevan revisión humana; las PR quedan abiertas mientras el trabajo independiente continúa desde `main`.
- El lint global se debe medir al inicio del ciclo y mantenerse separado de cambios de producto; el issue #98 sigue ese backlog.
- Las reglas visibles en Dashboard (como completar `daily_goal`) deben corresponder a la regla de negocio persistida y tener tests de umbral.
## [Ciclo 14] - E2E HTTP de explicación IA persistida (#114)

### Resumen
- Se añadió un E2E que monta los routers reales, crea un intento por HTTP y pide la explicación persistida con el fallback determinista de `explanation_rule`.
- Comprueba persistencia, caché sin cuota ni filas duplicadas, rechazo de acceso por otro usuario y ausencia de llamadas a proveedores externos.
- Se documentó el alcance y los invariantes en `docs/specs/ciclo14-ai-explanation-e2e.md`.

### Verificación
- Backend: 17/17 tests con una base MySQL temporal aislada; incluye la nueva ruta E2E.
- Frontend: `npm run build` OK.
- `git diff --check` OK.
- `npm run lint` sigue fallando en el baseline con 16 errores y 1 warning preexistentes; cubiertos por el issue #98 / PR #102, sin cambios frontend en este ciclo.
- El primer intento de suite backend fue bloqueado por `EPERM` al conectar con MySQL desde el sandbox; al repetirlo contra MySQL temporal, la suite pasó.

### Estado
- Issue #114 enlazado desde la PR #115 en `agent/test-ai-explanation-e2e`; `backend-test` y `frontend-build` pasaron en GitHub.
## [Ciclo 15] - README y GOAL_PROMPT alineados con el código (#116)

### Resumen
- README describe el catálogo real como 108 ejercicios originales estilo Cambridge: 36 por nivel B1/B2/C1 y 27 por cada parte 1–4.
- Alinea Stripe, política de autenticación por ruta, migraciones/seeds de desarrollo y las reglas reales de IA, racha, recompensas, tienda y rankings.
- `GOAL_PROMPT.md` establece que código, manifests y configuración son la fuente de verdad; los README deben actualizarse si divergen.
- `frontend/README.md` ya coincidía con el manifest React 19/Vite/Tailwind y no necesitó cambios.

### Verificación
- Contraste manual con `frontend/package.json`, `vite.config.ts`, `tailwind.config.js`, routers/controllers, `server.js`, configuración Sequelize y `contentCatalog.js` (conteo: 108/36/27).
- `git diff --check` OK; búsqueda de `Angular` en ambos README y `GOAL_PROMPT.md` sin coincidencias.
- No se ejecutaron tests ni build: ciclo solo documental, sin cambios de código ejecutable.

### Estado
- Issue #116 enlazado desde la PR #118 en `agent/docs-align-readme`; PR abierta para revisión.
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
