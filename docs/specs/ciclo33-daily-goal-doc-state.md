# Ciclo 33: sincronizar la documentación de `daily_goal` con `main`

Issue: #155
Rama: `agent/docs-daily-goal-merge-record`
Base: `origin/main` en `24ceedd` (PR #121).

## Problema y alcance

Las PRs #153 y #154 ya están integradas y sus issues #151 y #152 cerrados, pero el changelog y la spec del ciclo 32 aún describen las PRs como abiertas o pendientes. Además, `AGENTS.md` conserva la nota anterior a #152, aunque `PUT /users/me/daily-goal` ya valida enteros JSON entre 1 y 100.

Este ciclo reconcilia esos documentos con el estado verificado de `main`. No modifica lógica de aplicación, tests, esquema, API ni contenido del producto.

## Requisitos e invariantes

- **REQ-001**: `AGENTS.md` debe describir que el endpoint autenticado acepta únicamente enteros JSON de 1 a 100 y que rechaza valores inválidos.
- **REQ-002**: El changelog debe reflejar que PR #153 (#151) y PR #154 (#152) están integradas/cerradas, con sus merge commits.
- **REQ-003**: La spec del ciclo 32 debe conservar el historial de implementación y registrar su merge y la verificación más reciente de `main`.
- **REQ-004**: La spec del ciclo 31 debe dejar claro que su referencia al bug pendiente describe el estado de aquel ciclo y que el follow-up se completó después.
- **REQ-005**: El diff queda limitado a documentación y pasa `git diff --check`.
- **INV-001**: No cambiar archivos ejecutables, tests, configuración, contrato HTTP ni base de datos.

## Criterios de aceptación

- [ ] No queda en la guía actual la afirmación de que el backend permite decimales/strings o que #152 sigue pendiente.
- [ ] El changelog indica los merges `3061eff` (#153) y `ad0cfb1` (#154) y que #151/#152 están cerrados.
- [ ] La spec del ciclo 32 indica como estado final PR #154 integrada y registra las comprobaciones actuales de `main` (`24ceedd`).
- [ ] La spec del ciclo 31 conserva el contexto histórico sin presentarlo como estado actual.
- [ ] `git diff --check` y búsquedas de contradicciones pasan; no hay cambios de código.

## Plan

1. [x] Confirmar el estado del árbol, rama base, y evidencia de merge disponible para #153/#154.
2. [x] Corregir `AGENTS.md`, `AGENT_CHANGELOG.md` y las specs de los ciclos 31 y 32.
3. [ ] Buscar afirmaciones desactualizadas y revisar el diff documental.
4. [ ] Commit, push y PR enlazada a #155; revisar diff, checks y publicar self-review.

## Verificación

- Línea base de `main` (`24ceedd`): backend 41/41 con MySQL aislado y las cuatro migraciones Prisma; frontend 28/28 y `npm run build` correctos.
- `npm run lint` continúa con 12 errores y 1 aviso preexistentes, seguidos en #98/PR #102.
- Sin QA de interfaz ni TDD: este ciclo solo corrige documentación.

## Riesgos

Riesgo bajo: los cambios actualizan el historial documental usando los commits de merge y resultados de verificación disponibles. No cambian comportamiento del producto.
