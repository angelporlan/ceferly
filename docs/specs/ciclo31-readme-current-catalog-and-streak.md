# Ciclo 31: alinear README con el catálogo y la racha actuales

Issue: #151
Rama: `agent/docs-current-catalog-streak`
Base auditada al inicio: `origin/main` en `31ca4b1`. Verificación final contra `origin/main` en `2277923`.

## Problema y alcance

El README principal aún afirma que el catálogo tiene 108 ejercicios, 36 por nivel y 27 por parte. El catálogo actual y sus tests verifican 144 ejercicios, 48 por nivel, 36 por parte y 12 en cada combinación nivel/parte. El README también afirma que la racha no depende de completar la meta diaria; `recordExerciseAttempt` y `applyDailyPracticeStreak` solo avanzan la fecha/racha cuando los intentos persistidos del día UTC alcanzan `daily_goal`.

La auditoría detectó además que `updateDailyGoal` no validaba el tipo entero en servidor, aunque el parser de Dashboard sí. Al cierre de este ciclo se documentó el comportamiento y se abrió el follow-up #152; posteriormente, el ciclo 32 corrigió el endpoint en PR #154.

El cambio actualiza esas dos descripciones y añade notas de trabajo para el lint global, que sigue fallando en la línea base, y la sincronización de ramas paralelas, que causó conflictos repetidos en el changelog. Las afirmaciones de stack en `README.md`, `frontend/README.md`, `GOAL_PROMPT.md` y `AGENTS.md` ya coinciden con el código y se conservan.

## Requisitos, expectativas e invariantes

- **REQ-001**: README MUST describir los 144 ejercicios originales y su distribución B1/B2/C1 y partes 1–4 tal como la verifican los tests.
- **REQ-002**: README MUST explicar que la racha avanza al alcanzar `daily_goal` con intentos persistidos durante el día UTC, una vez por día; continúa si la última meta fue ayer y en otro caso vuelve a 1.
- **REQ-003**: El stack React 19/Vite/Tailwind y Express/Sequelize/MySQL MUST permanecer descrito según manifests y configuración actuales.
- **REQ-004**: `AGENTS.md` MUST indicar de forma concisa cómo diagnosticar un fallo de `npm run lint` global con ESLint enfocado en el archivo tocado, manteniendo visible el resultado global.
- **REQ-005**: `AGENTS.md` MUST recordar sincronizar una rama de PR con `origin/main` y conservar todas las entradas de `AGENT_CHANGELOG.md` al resolver conflictos.
- **REQ-006**: Al cierre de este ciclo, `AGENTS.md` MUST documentar que el backend aún no validaba enteros y remitir al follow-up #152; al completarse el ciclo 32, este dato queda histórico y la guía actual indica que solo acepta enteros JSON de 1 a 100.
- **INV-001**: Este ciclo MUST NOT cambiar lógica de aplicación, datos, esquemas, contratos ni rutas.
- **INV-002**: Las cifras del catálogo deben provenir del catálogo fuente y tests, no de supuestos del README histórico.
- **INV-003**: La regla de racha debe coincidir con el conteo de intentos UTC y sus tests; no debe insinuar avance por un intento aislado bajo la meta.

## Criterios de aceptación

- **AC-001 / REQ-001**: README dice 144 en total, 48 por nivel, 36 por parte y 12 por nivel/parte.
- **AC-002 / REQ-002**: No queda la afirmación de que la racha es independiente de `daily_goal`; se describe el umbral diario, continuidad y reinicio según la regla verificada.
- **AC-003 / REQ-003**: No se modifica la documentación de stack que ya coincide; la búsqueda de `Angular` sigue sin resultados en README y prompt.
- **AC-004 / REQ-004**: AGENTS recibe una regla accionable de diagnóstico focalizado, sin cambiar sus afirmaciones de stack/racha.
- **AC-005 / REQ-005**: AGENTS contiene la regla de sincronización y conservación del changelog.
- **AC-006 / REQ-006**: La descripción de AGENTS y la apertura de #152 fueron correctas al cierre del ciclo 31; el follow-up se completó después mediante PR #154, integrada en `main` (`ad0cfb1`) y enlazada al issue cerrado #152.
- **AC-007 / INV-001**: El diff no contiene cambios de código de producto.
- **AC-008**: `git diff --check`, tests backend, tests/build frontend y CI se ejecutan; la línea base del lint global se registra sin atribuir sus errores preexistentes al cambio.

## Plan

1. [x] Verificar cantidades en `uoeCatalog.test.js` y la regla de racha en servicio/modelo/tests.
2. [x] Editar README, AGENTS, spec y changelog con las afirmaciones verificadas.
3. [x] Repetir tests/build y lint global; hacer búsquedas de consistencia y `git diff --check`.
4. [x] Abrir PR `Closes #151` y publicar self-review.
5. [x] Esperar CI verde: 2 ejecuciones de backend-test y 2 de frontend-build.

## Línea base

- Al iniciar sobre `31ca4b1`: backend 28/28 tests, frontend 19/19 tests y build correctos.
- Lint global: falla con 12 errores y 1 aviso preexistentes en `GoogleLoginButton`, `ForgotPassword`, `Login`, `Profile`, `Register` y `auth.service.ts`; ya está cubierto por #98/PR #102.

## Verificación final

- Tras sincronizar `main` hasta `2277923`: backend 33/33 tests con migraciones aplicadas a MySQL desechable; frontend 22/22 tests y `npm run build` correctos.
- `npm run lint` conserva los mismos 12 errores y 1 aviso de la línea base; los cambios de este ciclo son Markdown.
- CI de PR #153: 2 ejecuciones de backend-test y 2 de frontend-build, todas verdes.
- PR #153 se integró en `main` mediante `3061eff`; issue #151 cerrado. El hardening que quedó como follow-up (#152) se completó después en el ciclo 32.
- Búsquedas de afirmaciones antiguas del catálogo/racha y `Angular`: sin resultados. `git diff origin/main...HEAD --check`: correcto.
- QA UI/API no aplica y TDD no aplica: no se cambió código ejecutable.

## Riesgos y verificación manual

Cambio documental reversible. No hay QA de UI/API que ejecutar porque no cambia comportamiento ejecutable.
