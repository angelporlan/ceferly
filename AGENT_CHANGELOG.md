# AGENT CHANGELOG

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
