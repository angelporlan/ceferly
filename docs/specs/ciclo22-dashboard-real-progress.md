# Ciclo 22 — Progreso real en el Dashboard

Issue: [#130](https://github.com/angelporlan/ceferly/issues/130)
Rama: `agent/fix-dashboard-real-progress`

## Problema y objetivo

`/learn` empieza con módulos de demostración y solo los reemplaza si la API devuelve datos válidos. El camino también asigna estrellas y estados completados según el orden del catálogo, aunque el backend no expone progreso por usuario. Las tarjetas de gamificación inventan una Liga Zafiro, el puesto #4, ascensos semanales y una probabilidad de aprobación un 84% mayor.

El Dashboard debe ofrecer práctica solo para módulos que `/api/categories` confirma que tienen ejercicios y describir únicamente datos reales disponibles.

## Alcance y decisiones

- El backend devuelve `categories[]`, cada elemento con `id`, `name` y `subcategories[]`; cada subcategoría incluye `id`, `name` y `totalItems`.
- Una subcategoría se puede mostrar solo si tiene identificador, nombre y `totalItems` numérico mayor que cero.
- La API no expone avance individual. El Dashboard mostrará módulos disponibles para practicar, sin estrellas, medallas, estados completados ni porcentaje de avance.
- El ranking disponible es global y se ordena por monedas. El Dashboard enlazará a esa clasificación sin atribuir liga, puesto o calendario.
- La cifra de aprobación se reemplaza por una recomendación neutral de práctica.
- Se conservan las interacciones existentes de nivel, meta diaria y racha; editar la meta y cambiar reglas de racha quedan fuera.

## Requisitos

- **REQ-001** El camino de aprendizaje MUST provenir exclusivamente de subcategorías pobladas recibidas de la API; MUST NOT conservar datos demo al vaciarse o fallar la carga.
- **REQ-002** El camino MUST distinguir carga, catálogo vacío y error; el error MUST ofrecer reintento.
- **REQ-003** Los módulos MUST NOT representar progreso individual hasta que exista un dato de progreso de usuario en la API.
- **REQ-004** El teaser MUST enlazar a la clasificación global por monedas y MUST NOT afirmar división, posición, ascenso ni periodo de competición.
- **REQ-005** La interfaz MUST NOT mostrar la afirmación porcentual no respaldada y MUST conservar una recomendación neutral para practicar.
- **REQ-006** Tests sin dependencias nuevas MUST cubrir el mapeo y filtrado del catálogo; CI MUST ejecutarlos y el build frontend MUST pasar.

## Expectativas y criterios de aceptación

- **AC-001 / REQ-001:** con categorías pobladas y vacías, solo se generan enlaces para subcategorías con `totalItems > 0`; conteos ausentes, cero o inválidos no se asumen como contenido.
- **AC-002 / REQ-001, REQ-003:** el mapeo produce únicamente identificador, título y categoría; no sintetiza estrellas ni estado de finalización.
- **AC-003 / REQ-002:** durante la petición aparece carga; una respuesta sin módulos ofrece un estado vacío; error HTTP o de red presenta reintento; reintentar vuelve a consultar la API.
- **AC-004 / REQ-004:** la tarjeta enlaza a `/leaderboard` y habla de clasificación global por monedas, sin liga, número de puesto ni ascensos.
- **AC-005 / REQ-005:** la recomendación no contiene probabilidades o porcentajes de aprobación.
- **AC-006 / REQ-006:** `npm test` cubre los casos del mapeo, `npm run build` pasa y la inspección manual confirma los estados visibles.

## Plan

1. Escribir tests de unidad del normalizador del catálogo y confirmar el fallo antes de implementar **(REQ-001, REQ-003; AC-001, AC-002)**.
2. Añadir el normalizador tipado y reemplazar la lista demo por estados carga/listo/vacío/error con reintento **(REQ-001, REQ-002, REQ-003; AC-001, AC-002, AC-003)**.
3. Simplificar el ranking y retirar la estadística no respaldada **(REQ-004, REQ-005; AC-004, AC-005)**.
4. Añadir el script de tests sin dependencias y conectarlo a CI; ejecutar tests, build, lint dirigido y smoke UI **(REQ-006; AC-006)**.

## Verificación y evidencia

- **TDD:** `node --test tests/dashboard-catalog.test.mjs` falló antes del normalizador con `ERR_MODULE_NOT_FOUND`; después de implementarlo, los tres casos pasan.
- **Tests:** `npm test` — 3/3.
- **Build:** `npm run build` — TypeScript y Vite pasan.
- **Lint:** ESLint dirigido a `Dashboard.tsx`, `dashboardCatalog.mjs` y el test — pasa. `npm run lint` completo conserva 14 errores y 1 aviso preexistentes en GoogleLoginButton, Header, ForgotPassword, Leaderboard, Login, Profile, Register y `auth.service.ts`.
- **Smoke UI con API mock local:** catálogo poblado muestra solo Conditionals y Word formation (se excluye la subcategoría con 0 ejercicios); catálogo vacío muestra estado vacío y acceso a categorías; HTTP 503 muestra error y Reintentar, que recupera los módulos al volver la API; petición lenta muestra el estado de carga.
- **Revisión visual:** el camino usa módulos de práctica sin estrellas ni estado de finalización; las tarjetas muestran recomendación neutral y clasificación global por monedas, sin cifras, liga o puesto inventados.
- **CI:** pendiente de la PR del ciclo.

## Riesgos y reversión

Es un cambio reversible solo de UI, tipos, tests y CI, sin migración ni cambio de API. Si aparece un cambio de contrato necesario, se detiene y se amplía el alcance mediante un issue separado.
