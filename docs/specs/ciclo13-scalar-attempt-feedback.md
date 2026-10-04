# Ciclo 13: desglose correcto de respuestas en el historial

Issue: #111
Rama: `agent/fix-scalar-attempt-feedback`

## Problema y alcance

`GET /api/attempts/:id` convierte las respuestas en un desglose por pregunta. Para intentos de una sola respuesta, tanto `user_answer` como `correct_answer` son escalares; tratarlos como mapas puede generar una línea por carácter y una precisión falsa. Este ciclo normaliza los valores escalares como una única respuesta y mantiene el formato multiparte.

## Criterios de aceptación

- **AC-001**: Una respuesta escalar correcta genera una sola marca correcta.
- **AC-002**: Una respuesta escalar incorrecta genera una sola marca incorrecta.
- **AC-003**: Los mapas multiparte conservan el número, orden e igualdad de sus marcas por hueco.
- **AC-004**: El endpoint serializa el mismo desglose normalizado utilizado por las pruebas unitarias.
- **AC-005**: No cambian puntuación, recompensas ni persistencia del intento.

## Invariantes

- **INV-001**: El feedback compara respuestas completas, sin iterar caracteres de cadenas.
- **INV-002**: Se conservan los identificadores de pregunta existentes para objetos/arrays multiparte.

## Plan

1. Escribir tests rojos para escalares correctos/incorrectos y mapas multiparte.
2. Extraer la normalización y construcción de marcas a un helper de servicio testeable.
3. Usar el helper en `GET /api/attempts/:id` sin alterar el cálculo de score.
4. Ejecutar backend tests, build frontend y diff check; revisar el endpoint.
5. Publicar PR enlazada al issue #111 con self-review.
