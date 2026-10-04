# AGENT CHANGELOG

## [Ciclo 8] - Inicialización única de Google Identity Services (#101)

### Resumen
GSI se inicializa una sola vez por client ID y usa un dispatcher hacia el handler de la pantalla montada. Login y registro siguen renderizando el botón y conservan el fallback.

### Verificación
- `frontend npm run build`: correcto.
- `backend npm test`: 16/16.
- QA: se alternó cuatro veces entre login y registro; no reapareció el warning de inicialización múltiple y la consola del navegador no registró warnings ni errores.
- `frontend npm run lint`: 14 errores preexistentes de tipos en el estado de `main`, sin warnings; el issue #98 los corrige en la PR #102.

### Estado
- Issue #101 reutilizado; warning reproducido antes del cambio en QA del ciclo anterior.
- Issue #101 enlazado desde PR #103, abierta con `needs-human-review` por afectar el flujo de login.
## [Ciclo 12] - E2E HTTP del intento de práctica (#110)

### Resumen
- Separa `app.js` del bootstrap para montar Express en pruebas sin ejecutar migraciones ni seeds de desarrollo.
- Añade un E2E HTTP de registro → catálogo → intento → historial, con fixture determinista, aserciones de persistencia/recompensas y limpieza.
- El cliente de Stripe se crea al usar pagos, así importar las rutas en pruebas no requiere claves ni llamadas externas.

### Verificación
- TDD: la prueba falló al faltar `app.js`; pasó tras extraer la app.
- MySQL temporal con migraciones: E2E 1/1; backend completo 17/17.
- `frontend npm run build`: OK; `git diff --check`: OK.
- La validación del historial detectó el desglose incorrecto de respuestas escalares; seguimiento registrado en #111.

### Estado
- Issue #110 enlazado a la PR #112, abierta desde `agent/test-practice-attempt-e2e`.
- La filtración de claves de respuesta sigue en la PR #100; este E2E no las usa para generar la respuesta.
- Spec: `docs/specs/ciclo12-practice-attempt-e2e.md`.
## [Ciclo 15] - README y GOAL_PROMPT alineados con el código (#116)
## [Ciclo 17] - E2E integrado desde registro hasta explicación (#120)

### Resumen
- Se añadió un E2E que registra al alumno por HTTP y conserva su JWT para recorrer niveles, categorías, lista/detalle de ejercicio, intento, resultado y explicación.
- Monta routers reales en Express temporal, persiste la explicación con `explanation_rule` y bloquea llamadas de red a proveedores.
- La spec de `docs/specs/ciclo17-full-learning-explanation-e2e.md` fija el flujo y su limpieza.

### Verificación
- E2E integrado: 1/1; suite backend: 17/17 con MySQL temporal y migraciones.
- Frontend: `npm run build` OK; `git diff --check` OK.
- En la primera ejecución del test, la forma escalar del fixture no coincidió con el resultado compuesto esperado; el fixture ahora usa respuestas por hueco y el flujo pasa. El manejo general de respuestas escalares sigue en #111/PR #113.
- Sin cambios de interfaz ni llamadas reales a IA/Stripe.

### Estado
- Issue #120 enlazado desde la PR #121 en `agent/test-full-learning-explanation-e2e`; PR abierta para revisión.
## [Ciclo 32] - Validar enteros en `daily_goal` (#152)

### Resumen
- Rechazar en el endpoint valores no enteros o fuera de rango antes de guardar la preferencia diaria del usuario.
- Mantener la ruta y autenticación, y verificar la no mutación ante peticiones inválidas.
- Contrato y plan: `docs/specs/ciclo32-daily-goal-integer-validation.md`.

### Estado
- Fix y regresión en `agent/fix-daily-goal-integer-validation`; TDD rojo confirmó que el string `"5"` se guardaba como 5 y que un body ausente daba 500.
- Verificación local tras sincronizar `main` hasta `abac93d`: backend 40/40 con las 4 migraciones Prisma en MySQL desechable (`127.0.0.1:3322`).
- PR #154 abierta con `needs-human-review` y self-review; CI verde para el HEAD anterior a la sincronización actual.

## [Ciclo 31] - README con catálogo y racha actuales (#151)

### Resumen
- Corregir en README la cantidad y distribución actual de ejercicios y la regla de racha ligada a `daily_goal`.
- Añadir instrucciones breves para diagnosticar el lint global desde archivos enfocados y sincronizar PRs con `main` conservando el changelog; no cambiar el comportamiento del producto.
- Corregir en AGENTS la descripción de validación de `daily_goal`; abrir #152 para el guard de enteros pendiente en backend.
- Spec: `docs/specs/ciclo31-readme-current-catalog-and-streak.md`.

### Verificación
- Línea base inicial (`31ca4b1`): backend 28/28, frontend 19/19 y build correctos.
- Tras sincronizar `main` (`2277923`): backend 33/33 en MySQL temporal, frontend 22/22 y build correctos.
- Lint global: continúa con 12 errores y 1 aviso preexistentes en auth/profile/ForgotPassword, cubiertos por #98/PR #102; no cambió el baseline.
- `git diff origin/main...HEAD --check` y búsqueda de afirmaciones antiguas del conteo/racha y de Angular: OK.
- La auditoría detectó y separó en #152 la falta de validación de enteros del endpoint; no se modificó código en este ciclo documental.
- TDD no aplica a este ciclo solo documental.
- QA UI/API: no aplica; no hay cambios ejecutables.

### Estado
- PR #153 abierta en `agent/docs-current-catalog-streak`, con self-review publicado; CI verde (2 backend-test y 2 frontend-build).

## Retrospectiva — ciclos 26–30

- Las correcciones de contenido deben verificarse en catálogo y en filas ya sembradas; el seeder `findOrCreate` no reconcilia registros existentes, así que usar migraciones condicionales y probar intentos asociados (#147).
- Los tests backend necesitan MySQL aislado con Prisma Migrate aplicado; si la conexión falta, el fallo no demuestra una regresión. Registrar ese entorno antes de interpretar el resultado.
- Las ramas paralelas vuelven a solaparse en la cabecera del changelog. Actualizar `origin/main` y conservar ambas entradas evita PRs en conflicto; esta regla queda en `AGENTS.md`.
## [Ciclo 23] - Soluciones compuestas legibles en ExercisePlayer (#139)

### Resumen
- El feedback tras un intento incorrecto presenta mapas de respuestas numeradas en orden, mantiene legibles las respuestas escalares/alternativas y se anuncia a lectores de pantalla.
- Se especificó el comportamiento en `docs/specs/ciclo23-readable-answer-feedback.md`; el cambio no modifica scoring ni API.
- Se abrió el issue #140 para el bug separado de entrada y scoring de ejercicios con varios huecos.

### Verificación
- TDD: `npm test` falló antes de crear el formateador; después pasa 14/14.
- `npm run build` pasa; ESLint dirigido a `ExercisePlayer.tsx`, `answerDisplay.mjs` y `answerDisplay.test.mjs` pasa sin avisos; `git diff --check` pasa.
- Smoke visual/accesible con mock local: `/exercises/139` no enseña la solución en idle y, tras una respuesta incorrecta, muestra `1. warmly / in a friendly way · 2. politely` y actualiza el estado accesible; `/results` conserva la respuesta legible en el fallback, sin JSON crudo.

### Estado
- Issue #139 enlazado desde la [PR #145](https://github.com/angelporlan/ceferly/pull/145); checks `backend-test` y `frontend-build` verdes.

## [Ciclo 30] - Reconciliar contenido UoE ya sembrado (#147)

### Resumen
- Añadir una migración de datos versionada para aplicar a ejercicios persistidos las correcciones de B1 Part 4 #3 y #5.
- Condicionar las actualizaciones a los valores antiguos conocidos y conservar IDs e intentos asociados.
- Spec: `docs/specs/ciclo30-reconcile-seeded-uoe-content.md`.

### Verificación
- TDD: el test falló antes de añadir la migración porque el archivo versionado aún no existía; después pasó.
- Backend: 29/29 tests en MySQL temporal aislado, con `origin/main` actualizado y todas las migraciones aplicadas.
- Frontend: 16/16 tests y build de producción OK.
- QA: el test conserva intentos y ediciones manuales; no hay rutas UI afectadas; `git diff --check` OK.

### Estado
- Issue #147 enlazado desde la PR #150 en `agent/fix-seeded-uoe-content`; relacionado con #143.

## [Ciclo 29] - Aplicar el límite de palabras a B1 Part 4 (#143)

### Resumen
- Corregir B1 Part 4 #3 y #5: cada respuesta aceptada tiene entre 2 y 5 palabras y conserva la keyword.
- En #5, usar una transformación pasiva natural de cuatro palabras con BECAUSE.
- Contrato y plan: `docs/specs/ciclo29-b1-part4-word-limit.md`.

### Estado
- Implementación y regresiones completadas en `agent/fix-b1-part4-word-limit`; PR #148 abierta con `Closes #143`.
- TDD: la prueba falló primero por `interests` y `because` de una palabra; tras corregir el catálogo, la suite backend completa pasa 27/27 y frontend 16/16 con build correcto tras integrar `main`.
- QA detectó que el seeder no reconcilia filas ya persistidas; follow-up #147 abierto para actualizar contenido existente de forma segura.

## [Ciclo 13] - Desglose correcto de respuestas en el historial (#111)
## [Ciclo 23] - Métricas personales confirmadas en Dashboard (#132)

### Resumen
- La meta diaria y la racha ahora usan los datos válidos de `/users/me/numberOfAttemptsToday`; se eliminan defaults personales inventados y se conservan ceros confirmados por la API.
- Sin sesión se ofrece iniciar sesión; carga, error, payload inválido y reintento tienen estados explícitos.
- Contrato y plan: `docs/specs/ciclo23-dashboard-stats-truth.md`; no cambian backend, edición de meta ni reglas de racha.

### Verificación local
- TDD: el test del parser falló antes de implementarlo; `npm test` pasa 3/3 y `npm run build` pasa.
- Lint de helper y tests pasa. El lint completo conserva 16 errores y 1 aviso, con dos errores preexistentes en el mapeo de categorías del Dashboard cubiertos por #98/PR #102.
- Smoke UI local: invitado, carga lenta, error HTTP, payload malformado y reintento con ceros API; la UI no inventa cifras ante datos ausentes.
- CI de la PR #133: `backend-test` y `frontend-build` verdes en `push` y `pull_request`.

### Estado
- Issue #132 enlazado por la PR #133, abierta con checks verdes en `agent/fix-dashboard-stats-truth`.
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
## [Ciclo 24] - Contadores de Header con datos autenticados (#135)

### Resumen
- El Header muestra racha, monedas y vidas solo después de validar la respuesta de `/users/me`; ceros explícitos siguen visibles y valores por defecto dejan de presentarse como perfil confirmado.
- Invitados conservan el acceso de login; carga, fallo o payload incompleto ocultan los chips sin tocar el flujo de recompensas de #104.
- Contrato y plan: `docs/specs/ciclo24-header-stats-truth.md`.

### Verificación local
- TDD: el test del parser falló antes de implementarlo; `npm test` pasa 3/3 y `npm run build` pasa.
- Lint dirigido pasa. El lint global conserva 15 errores y 1 aviso; este cambio elimina el error previo de Header y el resto sigue cubierto por #98/PR #102.
- Smoke UI local: invitado, carga lenta, perfil válido, error HTTP, payload incompleto y ceros API confirmados.
- CI de la PR #136: `backend-test` y `frontend-build` verdes.

### Estado
- Issue #135 enlazado por la PR #136, abierta con checks verdes en `agent/fix-header-stats-truth`.

## [Ciclo 4] - Documentación alineada con React y Vite (#95)

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

## [Ciclo 26] - Catálogo equilibrado de 144 ejercicios Use of English (#138)

### Resumen
- Se añadieron 36 ejercicios originales a B1 Preliminary, B2 First y C1 Advanced.
- El catálogo suma 144 preguntas: 48 por nivel, 36 por parte y 12 en cada combinación nivel/parte.
- Contrato y plan en `docs/specs/ciclo26-uoe-catalog-144.md`.

### Verificación local
- TDD: las pruebas nuevas fallaron con el catálogo inicial (`108 !== 144`, 36 en vez de 48 por nivel).
- `backend npm test`: 19/19; `frontend npm run build`: correcto.
- `git diff --check`: correcto; tests validan tipos, títulos únicos, respuestas, explicaciones y formato de Part 4.
- Sin cambios de UI, esquema ni seeder.
- CI de la PR #141: `backend-test` y `frontend-build` verdes.

### Estado
- Issue #138 enlazado por la PR #141, abierta en `agent/feat-uoe-catalog-144` con checks verdes.

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
## [Ciclo 28] - Puntuar cada hueco en ejercicios compuestos (#140)

### Resumen
- El reproductor muestra un campo por marcador numerado, exige completarlos y envía las respuestas como objeto indexado; `/results` conserva ese objeto.
- El scorer compara cada valor con su clave, deriva el total desde la solución y persiste aciertos parciales y porcentaje sin conceder recompensa de respuesta completa.
- Spec: `docs/specs/ciclo28-multigap-exercise-scoring.md`.

### Verificación
- Frontend: `npm test` 14/14, ESLint dirigido sin errores y `npm run build` OK.
- Backend scorer: `node --test test/scoring.test.js` 6/6; TDD confirmó primero los cuatro casos nuevos fallando.
- Backend: `npm test` — 26/26 con migraciones aplicadas en MySQL desechable aislado; incluye persistencia de respuestas parciales (`2/3`, score `67`).
- QA con mock HTTP local: dos campos numerados, botón bloqueado hasta completar ambos, POST `{userAnswer:{"1":"finished","2":"wrong"},totalGaps:2}`, feedback de intento no completo y navegación a `/results`.
- Revisión de catálogo: marcadores visibles coinciden con claves de solución en 26/26 Word Formation, 30/30 Key Word Transformation y 20/20 Conditionals.

### Estado
- Issue #140 enlazado por la PR #149 (`agent/fix-multigap-exercise-scoring`), abierta para revisión; `backend-test` y `frontend-build` verdes y self-review publicado.

## [Ciclo 10] - Aplicar racha al cumplir la meta diaria (#106)


### Resumen
La racha solo avanza cuando el número de intentos persistidos del día UTC alcanza `daily_goal`. Los intentos por debajo de la meta conservan la racha y fecha anterior; los intentos siguientes no vuelven a incrementarla. Se eliminó el helper de controlador que no tenía callers.


### Verificación
- TDD: el test de umbral falló antes del cambio (`3 !== 2`) y pasó después.
- `backend npm test`: 18/18 con MySQL temporal en `127.0.0.1:3313`, migraciones aplicadas.
- `frontend npm run build`: correcto.
