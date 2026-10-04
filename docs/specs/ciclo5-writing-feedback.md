# Ciclo 5: intentos de Writing con feedback

Issue: #94
Rama: `agent/feat-writing-feedback`

## Objetivo

Completar el recorrido de un ejercicio `essay` o `writing`: redactar, guardar el texto y pedir feedback cualitativo al tutor IA.

## Criterios de aceptación

- El player presenta una respuesta multilínea para Writing, valida que no esté vacía y muestra el recuento de palabras.
- Solo una sesión autenticada puede enviar Writing. El backend conserva el texto original del alumno en `UserExerciseAttempt`.
- El intento queda `pending_feedback`: no se compara con el texto modelo ni consume una vida; sí cuenta como práctica para racha/meta y concede las monedas de finalización del rol.
- `POST /attempts/:id/explain` genera y cachea feedback mediante el cliente inyectable. El prompt evalúa la respuesta al encargo, claridad, organización y uso del inglés sin exigir coincidencia literal ni inventar una nota Cambridge oficial.
- Al guardar el feedback, el intento pasa a `feedback_available`. Los intentos pendientes no reducen promedios de precisión ni el ranking de promedio.
- Resultados muestran el texto enviado y el feedback, sin marcar el Writing como acierto/error ni mostrar una precisión ficticia.
- La migración añade el estado con valor predeterminado para preservar intentos existentes y documenta su reversión.
- Tests cubren el guardado, las recompensas, el prompt de Writing y la transición/caché del feedback.
- La identidad visual Ceferly se mantiene.

## Migración y reversión

La migración agrega `grading_status` con default `graded`, sin reescribir intentos existentes. Para revertirla en una base de test: `ALTER TABLE user_exercise_attempts DROP COLUMN grading_status;`.

## Fuera de alcance

- Puntuación numérica o certificación automática Cambridge.
- Listening, C2 y placement.
- Cambios a pagos o autenticación.

## Plan

1. Añadir tests de scoring/estado y de generación de prompt que fallen antes de implementar.
2. Extender el modelo y crear una migración aditiva para el estado de evaluación.
3. Implementar guardado y feedback de Writing, manteniendo intacto el scoring objetivo.
4. Adaptar el player, resultados y agregados de precisión.
5. Ejecutar tests, build y lint focalizado; hacer QA del recorrido Writing con datos de test.
