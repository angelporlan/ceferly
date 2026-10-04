# Ciclo 25: recompensa única y meta diaria para Writing

Issue: #134  
Rama: `agent/fix-writing-reward-dedupe`

## Objetivo

Impedir que volver a enviar el mismo ejercicio Writing genere monedas repetidas y hacer que todos los intentos persistidos, incluidos los de Writing, participen en el umbral de meta diaria y racha.

## Criterios de aceptación

- Por usuario y ejercicio de tipo `essay` o `writing`, solo el primer intento persistido concede monedas.
- La comprobación se basa en intentos guardados en servidor, incluye intentos previos al despliegue y es segura ante envíos concurrentes del mismo usuario.
- Los reenvíos siguen guardando su intento y cuentan para la meta diaria, pero no vuelven a conceder monedas.
- Writing participa en el mismo contador UTC y en la misma actualización de racha que los ejercicios objetivos.
- Los tests backend cubren reenvíos, recompensa única, umbral/meta diaria y aislamiento entre usuarios.

## Invariantes

- No se impide guardar intentos repetidos: la deduplicación afecta solo a la recompensa de monedas.
- La identidad del beneficio es `(user_id, exercise_id)` y el historial `user_exercise_attempts` es su registro persistido.
- El bloqueo transaccional de la fila del usuario serializa intentos del mismo usuario; la creación del intento y la actualización de saldo/racha se confirman juntas.
- La regla de monedas aplica solo a Writing. Los ejercicios cerrados conservan sus recompensas actuales.
- La integración mantiene el comportamiento de Writing pendiente de feedback definido en la PR #99 y el umbral diario definido en la PR #107.

## Plan

1. Añadir pruebas de integración rojas para reenvío, aislamiento entre usuarios y conteo mixto de Writing + ejercicio cerrado.
2. Hacer atómico el guardado, la deduplicación de recompensa, el conteo UTC y la persistencia de progreso.
3. Extender la regla diaria para que la racha avance únicamente al alcanzar `daily_goal`.
4. Ejecutar suite backend, build frontend requerido por CI y revisión de diff/QA.

## Persistencia y reversión

No requiere migración: los intentos existentes ya contienen la clave `(user_id, exercise_id)` necesaria para deduplicar. Ante un fallo transaccional, el intento y el cambio de monedas/meta se revierten juntos. La reversión consiste en restaurar el flujo anterior de `recordExerciseAttempt` y `applyAttemptRewards`.

## Verificación local

- TDD rojo confirmado: antes del cambio, dos reenvíos simultáneos produjeron dos recompensas (`2 !== 1`).
- `backend npm test`: 17/17.
- `frontend npm run build`: correcto.
- `node --check` y `git diff --check`: correctos.
- No se modificaron rutas UI; el servicio verifica el flujo con fixtures de base de datos.
- CI de la PR #137: `backend-test` y `frontend-build` pasan.

## Riesgos

- `attempt.service.js` y `gamification.js` también cambian en las PRs abiertas #99 y #107; al integrar ramas se debe conservar una sola transacción, una sola regla de escritura y el conteo de intentos que incluya Writing.
- Los bloqueos por usuario serializan envíos simultáneos de ese usuario, a cambio de garantizar una recompensa única.
