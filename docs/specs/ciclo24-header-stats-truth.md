# Ciclo 24 — Contadores de Header con datos autenticados

Issue: [#135](https://github.com/angelporlan/ceferly/issues/135)
Rama: `agent/fix-header-stats-truth`

## Problema y objetivo

El Header inicializa racha, monedas y vidas en cero y siempre renderiza los chips. La petición de `/users/me` solo corre cuando hay token; si falta token, falla o devuelve datos incompletos, las cifras por defecto siguen pareciendo datos personales reales.

## Alcance y decisiones

- Los contadores `streak`, `coins` y `hearts` solo se muestran tras validar esos campos numéricos en una respuesta autenticada de `/users/me`.
- Ceros explícitos son datos reales; faltantes, negativos, fraccionarios o no numéricos no se sustituyen por defaults.
- Invitado conserva el acceso a iniciar sesión; carga o fallo simplemente no muestran los chips personales.
- No cambia el nombre/avatar por defecto, los permisos, la API ni la sincronización de recompensas del issue #104.

## Requisitos

- **REQ-001** Los chips de Header MUST mostrarse solo después de una respuesta válida de `/users/me`.
- **REQ-002** Sin token, Header MUST ocultar los chips personales y conservar el acceso a login.
- **REQ-003** Ceros explícitos MUST conservarse; carga, fallo y campos inválidos MUST NOT mostrar contadores por defecto.
- **REQ-004** El arreglo MUST conservar perfil y actualizaciones de recompensas existentes; no debe cambiar auth ni backend.
- **REQ-005** Tests sin dependencias nuevas MUST verificar el parser; CI MUST ejecutarlos y el build MUST pasar.

## Expectativas y criterios de aceptación

- **AC-001 / REQ-001, REQ-003:** `{ streak: 0, coins: 0, hearts: 0 }` produce contadores válidos con ceros.
- **AC-002 / REQ-002:** sin token no aparecen los chips de racha, monedas o vidas; el botón Entrar permanece.
- **AC-003 / REQ-003:** durante carga, tras error HTTP/red o payload incompleto no aparecen valores 0 inferidos.
- **AC-004 / REQ-001, REQ-004:** tras respuesta válida aparecen exactamente los tres valores del servidor y los datos de perfil conservan su comportamiento.
- **AC-005 / REQ-005:** `npm test` y `npm run build` pasan; smoke UI confirma estados invitado, error y valores confirmados.

## Plan

1. Escribir tests del parser para ceros explícitos, campos ausentes e inválidos; comprobar el rojo inicial **(REQ-001, REQ-003; AC-001, AC-003)**.
2. Añadir parser y estado de datos confirmados al Header; renderizar chips solo cuando el parser acepte la respuesta **(REQ-001–004; AC-001–004)**.
3. Añadir tests a CI, ejecutar build/lint dirigido y smoke UI **(REQ-005; AC-005)**.

## Verificación y evidencia

- **TDD:** `node --test tests/header-stats.test.mjs` falló antes del parser con `ERR_MODULE_NOT_FOUND`; después de implementarlo, los tres casos pasan.
- **Tests:** `npm test` — 3/3.
- **Build:** `npm run build` — TypeScript y Vite pasan.
- **Lint:** ESLint focalizado en `Header.tsx`, `headerStats.mjs` y el test pasa. `npm run lint` global conserva 15 errores y 1 aviso en otros archivos; el error previo de `setState` síncrono de Header desaparece y #98/PR #102 sigue cubriendo la deuda restante.
- **Smoke UI con API mock local:** visitante anónimo sin chips y con enlace Entrar; carga sin cifras; perfil válido muestra `3/12/4`; HTTP 503 y payload sin `hearts` ocultan chips; payload válido `0/0/0` muestra los ceros confirmados.
- **Revisión visual:** el Header conserva alineación y botón de perfil/entrada con y sin contadores.
- **CI:** `backend-test` y `frontend-build` pasan en la PR #136.

## Riesgos y reversión

Cambio reversible de UI/tipos/tests/CI, sin datos persistidos. PR #105 también modifica Header y el evento de recompensas; preservar esa actualización si ambas ramas se integran. PRs #131–#133 añaden runner frontend y bloque CI, así que se debe mantener un solo paso de `npm test`.
