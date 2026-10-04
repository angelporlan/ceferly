# Ciclo 27: soluciones compuestas legibles en el reproductor

Issue: #139  
Rama: `agent/fix-composite-answer-display-139`

## Objetivo

Mostrar respuestas esperadas de ejercicios compuestos como respuestas numeradas, en lugar de `String(object)` o JSON, y mantenerlas ocultas hasta el feedback de un intento incorrecto.

## Criterios de aceptación

- Las soluciones escalares siguen siendo texto legible y sus alternativas se conservan.
- Los mapas con huecos numerados se ordenan numéricamente y muestran alternativas de cada hueco.
- El reproductor no representa objetos como `[object Object]`, `undefined` o JSON crudo.
- Antes del envío y tras un acierto no se ofrece la respuesta esperada; tras un fallo sí.
- El feedback de respuesta incorrecta se anuncia mediante `role="alert"` después de pulsar «Comprobar».
- Tests unitarios `node:test` cubren valores escalares, listas/mapas, orden y visibilidad; el build frontend pasa.

## Plan

1. Añadir tests rojos para el formateador y la condición de visibilidad del feedback.
2. Implementar un helper puro para formatear respuestas escalares y compuestas.
3. Usar el helper en el feedback de ExercisePlayer y en el contexto de resultados/explicación.
4. Ejecutar tests frontend, build y `git diff --check`.

## Riesgos y reversión

- Las listas se interpretan como alternativas de una solución; los objetos con claves numéricas, como huecos que deben numerarse.
- No cambia API, contrato de intentos ni scoring. Revertir el helper y sus usos restaura la representación anterior.

## Resultado y verificación

- El reproductor formatea los valores compuestos desde un helper puro y usa el mismo formato para el contexto enviado al estado de resultados.
- `frontend npm test`: 15/15 pruebas aprobadas, incluidas las nuevas pruebas de formato y visibilidad.
- `frontend npm run build`: correcto.
- ESLint dirigido a `ExercisePlayer.tsx`, el helper y sus pruebas: sin errores ni advertencias.
- QA visual y accesible con un ejercicio sintético de tres huecos: antes de responder no se muestra la solución; tras responder mal el nodo `role="alert"` aparece con la respuesta numerada en orden (1, 2, 3) y mantiene las alternativas con `/`.
- `git diff --check`: correcto.

## Fuera de alcance

- Controles para responder varios huecos y scoring parcial, que pertenecen al issue #140.
- Ocultamiento de claves de respuesta en el API, cubierto por #97.
