# Ciclo 23 — Métricas personales confirmadas en Dashboard

Issue: [#132](https://github.com/angelporlan/ceferly/issues/132)
Rama: `agent/fix-dashboard-stats-truth`

## Problema y objetivo

`/learn` inicializa meta diaria, intentos y racha con `5`, `0` y `0`. Si no hay token no carga datos personales; si la petición falla, el error se ignora y los defaults permanecen visibles como si fueran reales.

El endpoint autenticado `GET /users/me/numberOfAttemptsToday` ya entrega `attemptsToday`, `dailyGoal` y `streak` (también `numberOfAttempts` como alias). La UI debe mostrar métricas personales solo con una respuesta válida.

## Alcance y decisiones

- Sin token, Dashboard ofrece un enlace para iniciar sesión en lugar de mostrar valores personales inventados.
- Con token, se consulta el endpoint de estadísticas una sola vez. Un valor numérico `0` devuelto por la API es válido; valores ausentes, malformados o una respuesta HTTP fallida no se convierten a cero.
- Los estados de estadísticas serán carga, invitado, error/reintento y datos confirmados.
- Se mantienen la edición de meta diaria (#108) y el cálculo de racha (#106) fuera de alcance; no cambia el backend ni la autenticación.
- El endpoint requiere token y el backend devuelve los tres valores en la misma respuesta, por lo que el contrato puede verificarse sin cambiar servidores.

## Requisitos

- **REQ-001** Las cifras personales MUST provenir de una respuesta válida de `/users/me/numberOfAttemptsToday`.
- **REQ-002** La interfaz MUST distinguir carga, usuario sin sesión, error de API y datos disponibles; en los tres primeros casos MUST NOT mostrar valores personales default.
- **REQ-003** Ceros explícitos de la API MUST conservarse como valores reales; campos ausentes o inválidos MUST producir estado no disponible.
- **REQ-004** El error MUST ofrecer reintento y una respuesta anterior MUST NOT reemplazar el resultado de un intento más reciente ni actualizar una pantalla desmontada.
- **REQ-005** Tests sin dependencias nuevas MUST cubrir el parser; CI MUST ejecutarlos y el build frontend MUST pasar.

## Expectativas y criterios de aceptación

- **AC-001 / REQ-001, REQ-003:** un payload válido con `attemptsToday: 0`, `dailyGoal: 5` y `streak: 0` produce exactamente esos valores; el alias `numberOfAttempts` se acepta si `attemptsToday` no existe.
- **AC-002 / REQ-002:** sin token se muestra un acceso a iniciar sesión y no aparecen `0 / 5` ni `racha activa de 0 días`.
- **AC-003 / REQ-002, REQ-003:** durante la petición se muestra carga; HTTP no exitoso, fallo de red o payload incompleto muestra error en lugar de defaults.
- **AC-004 / REQ-004:** reintentar vuelve a consultar el endpoint; respuestas de una petición descartada no pueden alterar el estado actual.
- **AC-005 / REQ-005:** `npm test`, lint de los archivos nuevos y `npm run build` pasan; smoke UI confirma estados invitado, error/reintento y valores reales.

## Plan

1. Escribir tests del parser para ceros, alias, valores ausentes e inválidos; observar el fallo previo **(REQ-001, REQ-003; AC-001, AC-003)**.
2. Crear el parser tipado y el estado de métricas del Dashboard con invitado/carga/error/listo y cancelación lógica de peticiones antiguas **(REQ-001–004; AC-001–004)**.
3. Añadir runner `node:test` y el paso frontend en CI, y verificar tests, build, lint y smoke UI **(REQ-005; AC-005)**.

## Verificación y evidencia

- **TDD:** `node --test tests/dashboard-stats.test.mjs` falló antes de crear el parser con `ERR_MODULE_NOT_FOUND`; tras implementarlo, los tres casos pasan.
- **Tests:** `npm test` — 3/3.
- **Build:** `npm run build` — TypeScript y Vite pasan.
- **Lint:** ESLint en `dashboardStats.mjs` y `dashboard-stats.test.mjs` pasa. `Dashboard.tsx` conserva dos errores `no-explicit-any` en el mapeo de catálogo anterior, ya incluidos en #98/PR #102; el lint global sigue mostrando 16 errores y 1 aviso de esa deuda.
- **Smoke UI con API mock local:** sin token aparece enlace de login sin cifras personales; una petición lenta muestra carga; HTTP 503 y payload malformado muestran error; reintento con respuesta válida de cero muestra `0 / 5` y `racha activa de 0 días`.
- **Revisión visual:** el estado de error mantiene la tarjeta compacta y presenta un botón de reintento accesible.
- **CI:** `backend-test` y `frontend-build` pasan en los eventos `push` y `pull_request` de la PR #133.

## Riesgos y reversión

Es un cambio reversible en UI, parser, tests y CI. PR #131 también modifica `Dashboard.tsx` y añade el runner frontend; PR #109 edita la tarjeta de meta diaria. La integración de esos cambios debe conservar una sola llamada de test en el workflow y los cambios de cada tarjeta.
