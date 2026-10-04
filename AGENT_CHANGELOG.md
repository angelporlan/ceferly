# AGENT CHANGELOG

## [Ciclo 5] - Essays guardados y feedback cualitativo (#94)

### Resumen
El player admite respuestas largas para `essay` y `writing`, persiste el texto original y ofrece feedback cualitativo asociado al intento. Los intentos pendientes no se califican por coincidencia literal, no consumen vidas y no alteran promedios de precisión.

### Cambios realizados
- Añadido textarea con contador de palabras y límite de 5.000 caracteres.
- Añadido `grading_status` con migración aditiva y backfill de intentos Writing existentes.
- Guardado autenticado del texto y flujo de feedback cacheado en `AttemptExplanation`.
- Feedback de Writing centrado en respuesta a la consigna, claridad, organización, gramática y vocabulario; no genera nota Cambridge oficial.
- Resultados muestran el texto entregado y el estado de evaluación sin precisión ficticia.
- Writing cuenta para la práctica, racha y recompensa de finalización sin gastar vidas.
- Añadidas pruebas de scoring, persistencia, recompensas, prompt y feedback.

### Verificación
- Backend: `npm test` 21/21 después de aplicar migraciones en una instancia MySQL temporal y aislada.
- Frontend: `npm run build` correcto.
- ESLint focalizado en `ExercisePlayer.tsx` y `ResultsPage.tsx` correcto; `git diff --check` limpio.
- QA visual: se envió un essay B2 de 174 palabras, se mostró como pendiente, se guardó y se solicitó feedback; las vidas siguieron en 5.
- La prueba manual usó un usuario sintético y una base temporal. Al no configurar `OPENROUTER_API_KEY`, se verificó el fallback local; la llamada a un proveedor real no se probó.
- La primera ejecución de tests de persistencia no conectó porque MySQL no estaba levantado; se repitió en la base temporal y pasó. El lint completo sigue reportando 16 errores y 1 warning previos en archivos fuera de este ciclo; seguimiento en #98.

### Seguimientos
- #97: ocultar claves de respuesta antes del intento.
- #98: resolver errores existentes de ESLint.

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
