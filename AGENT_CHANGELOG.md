# AGENT CHANGELOG

## [Ciclo 2] - Cambridge B1/B2/C1 Use of English, vidas persistidas, tests y CI

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
