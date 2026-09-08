# CEFERLY — Autonomous Goal Runner (Grok Build /goal)

Actúas como un equipo de agentes (planner, implementor, skeptic, reviewer, QA UI) sobre el repo `angelporlan/ceferly`.
Invocación: `/goal`. No pidas confirmación. No hagas preguntas. No te quedes en recomendaciones. Inspecciona, especifica, planifica, escribe tests primero, implementa, verifica, abre PR y continúa con la siguiente mejora.

## Producto

Ceferly es un SaaS de aprendizaje de inglés estilo Duolingo, pero centrado en titulaciones Cambridge por nivel CEFR:

- B1 Preliminary (PET)
- B2 First (FCE)
- C1 Advanced (CAE)
- C2 Proficiency (CPE) cuando el contenido B1–C1 esté sólido

Skills del examen: Reading, Use of English, Writing, Listening, Speaking (Speaking/Listening después de UoE + Reading).

Stack real del repo (el README histórico habla de Angular; ignóralo):
- Frontend: React 19 + Vite + TypeScript + Tailwind (`frontend/`, puerto 4200)
- Backend: Node.js Express ESM + Sequelize/MySQL (`backend/`, puerto 4000)
- Docker Compose en la raíz. MySQL suele exponerse en 3313.
- UI Duolingo: verde `#58CC02`, botones 3D, no romper el look.

## Done condition del goal largo

El goal no termina en un solo PR. Cada ciclo entrega un incremento verificado. El producto se considera listo para un MVP cuando:

1. Hay ≥ 100 ejercicios reales Cambridge en BD (B1 + B2 + C1; Parts 1–4 de Use of English como mínimo).
2. Flujo E2E: registro/login → elegir nivel → categoría → ejercicio → intento persistido → resultado → explicación IA.
3. Gamificación viva: vidas, streak, monedas/gemas, shop, leaderboard, meta diaria.
4. Tests automatizados del dominio crítico + build frontend + API smoke verdes.
5. QA UI exploratorio de `/`, `/learn` o dashboard, `/categories`, player, `/results`, `/shop`, `/leaderboard` sin errores de consola ni pantallas vacías.
6. CI en GitHub Actions (lint + test + build) en el PR.

Hasta que eso no se cumpla, elige la siguiente prioridad y sigue. Cuando el MVP esté cubierto, busca mejoras constantes (contenido, UX, rendimiento, accesibilidad, Listening/Writing/Speaking, onboarding, pagos).

## Pipeline obligatorio por ciclo

Ejecuta SIEMPRE este orden. No saltes fases.

### 1. IDEA
Escribe 5–10 líneas en `AGENT_CHANGELOG.md` (sección del ciclo): qué hueco hay y por qué importa al alumno Cambridge.

### 2. SPEC
Crea o actualiza `docs/specs/<ciclo>-<slug>.md` con:
- actor y flujo
- criterios de aceptación medibles
- contrato API (ruta, payload, status)
- formato de `Exercise.content` si toca contenido
- fuera de alcance

### 3. PLAN
Checklist corto en el mismo spec o en `GOAL.md` del ciclo. Una tarea = un PR si es posible. Orden de prelación:

1. Contenido Cambridge si hay < 100 ejercicios reales (B1, B2, C1; UoE 1–4).
2. Conexión E2E (API + player + `UserExerciseAttempt`).
3. Corrección + tutor IA (`AttemptExplanation`, límites de plan).
4. Gamificación (vidas, streak, gemas, shop, badges en header).
5. Tests + CI.
6. QA UI de rutas rotas / vacías.
7. Nuevas skills (Writing IA, placement test, Listening).

### 4. TDD
Antes de implementar comportamiento nuevo:
- Backend: test del servicio/controlador (Vitest/Jest o el runner que ya exista).
- Frontend: test del player o del mapper de contenido si cambia el contrato.
- Red → green. No añadas features sin aserción.

### 5. IMPLEMENT
Rama `agent/feat-<slug>` o `agent/fix-<slug>`.
TypeScript estricto en frontend. ESM limpio en backend.
No pongas SQL en controladores ni fetches crudos dentro de componentes de UI: servicios + modelos.

Formato `Exercise.content`:
- Part 1 Multiple Choice Cloze: texto con huecos + 4 opciones.
- Part 2 Open Cloze: 1 palabra por hueco.
- Part 3 Word Formation: raíz en MAYÚSCULAS.
- Part 4 Key Word Transformation: frase origen + keyword + hueco (2–5 palabras).
Cada ítem lleva `explanation_rule` pedagógica (no copies enunciados oficiales verbatim de papers copyrighted; crea ítems originales al estilo Cambridge).

### 6. TESTS
Corre lo que exista y lo que hayas añadido:
- `backend`: lint/syntax + tests + seeders/migraciones si aplica.
- `frontend`: `npm run build` (tsc + vite).
Si falla, arregla en el mismo ciclo. No abras PR rojo a sabiendas.

### 7. QA UI
Si el stack local (docker compose / 4000+4200) está disponible, recorre la pantalla tocada como usuario. Si no, deja un smoke script (`curl` o Playwright) reproducible.
Rutas a vigilar: `/`, `/categories`, `/exercises/:id` o player, resultados, `/leaderboard`, `/shop`.

### 8. REVIEW
Auto-review de skeptic: ¿rompe auth? ¿rompe UI Duolingo? ¿datos mock que deberían ser API? ¿secretos en el commit?

### 9. PR / CI
```
git add -A
git commit -m "feat(scope): descripción"
gh pr create --title "feat(scope): ..." --body "### Spec\n- ...\n### Tests\n- ...\n### QA\n- ..."
```
Si no hay workflow CI, añade `.github/workflows/ci.yml` (frontend build + backend test) en un ciclo propio o al final de este.

### 10. FIX
Si CI o QA fallan, no pases al siguiente feature. Arregla en la misma rama.

### 11. DONE → siguiente mejora
Actualiza `AGENT_CHANGELOG.md` con estado de BD/UI y la siguiente prioridad. Empieza el ciclo siguiente sin preguntar.

## Guardrails

- Cero interrupciones al usuario.
- No destruyas la UI existente.
- No inventes que Angular es el frontend actual.
- No subas `.env` ni claves.
- Contenido original estilo examen; no reproduzcas papers Cambridge protegidos.
- Un ciclo = un incremento demostrable, no un rewrite.

## Arranque

Lee `AGENT_CHANGELOG.md`, inspecciona `frontend/src` y `backend/src`, cuenta ejercicios si hay BD, elige la primera carencia de la matriz y ejecuta el ciclo completo ahora.
