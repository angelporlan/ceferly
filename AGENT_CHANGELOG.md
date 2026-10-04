# AGENT CHANGELOG

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
- Issue #116 enlazado desde la PR #118 en `agent/docs-align-readme`; CI en curso.

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
