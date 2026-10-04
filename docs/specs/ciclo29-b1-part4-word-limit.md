# Ciclo 29: límite de palabras en B1 Part 4

Issue: #143  
Rama: `agent/fix-b1-part4-word-limit`

## Problema y alcance

En el catálogo B1 Use of English Part 4, el ejercicio #3 acepta `interests` (una palabra) y el #5 acepta `because` (una palabra). El formato Key Word Transformation exige respuestas de 2–5 palabras, incluida la keyword. Se corregirán exclusivamente esos dos ejercicios.

Para el #5 se cambiará el enunciado con hueco a una transformación pasiva equivalente: `The match ______ the rain.` La respuesta `was cancelled because of` contiene cuatro palabras, conserva BECAUSE y mantiene el significado de la frase original.

## Criterios de aceptación

- Todas las alternativas aceptadas para B1 Part 4 #3 y #5 contienen de 2 a 5 palabras.
- Cada respuesta conserva la keyword suministrada (`INTEREST` o `BECAUSE`).
- Las frases original y transformada conservan el significado; los enunciados siguen siendo naturales y claros.
- Tests de regresión verifican el número de palabras y la keyword de todas las alternativas.
- No se modifican scoring general, esquema, seeder ni interfaz.

## Plan

1. Añadir un test rojo que localice los ejercicios #3 y #5 del catálogo y falle por las alternativas actuales de una palabra.
2. Quitar `interests` de #3 y reformular #5 en voz pasiva con `was cancelled because of`.
3. Ejecutar la suite backend, revisar los enunciados y validar `git diff --check`.
4. Publicar una PR vinculada a #143 con tests y QA editorial.

## Reversión y riesgos

- El cambio solo afecta dos registros del catálogo; revertirlos restaura el contenido anterior.
- La voz pasiva de #5 debe permanecer gramatical y equivalente a la frase original.

## Avance y verificaciones

- El issue #143 ya existía y estaba abierto; no se creó otro issue.
- La prueba roja inicial confirmó las infracciones: `interests` no conservaba literalmente INTEREST y `because` tenía una sola palabra.
- #3 ahora acepta únicamente `is of interest to`.
- #5 ahora pide `The match ______ the rain.` y acepta `was cancelled because of`, que conserva el significado y BECAUSE.
- TDD: `node --test test/uoeCatalogPart4.test.js` falló inicialmente por las alternativas de una palabra y pasa 2/2 después del cambio.
- `backend npm test`: 23/23 con esquema migrado en un contenedor MySQL temporal sin volumen persistente.
- `frontend npm run build`: correcto; `node --check backend/src/cambridge/uoeCatalog.js` y `git diff --check`: correctos.
- QA editorial: la frase #3 usa la equivalencia `be interested in` / `be of interest to`; la #5 conserva el significado con la pasiva `was cancelled because of the rain`.

## Follow-up detectado

`seedCambridgeUseOfEnglish` no actualiza el contenido cuando ya existe una fila completa con el mismo nivel. Por eso, bases de datos ya sembradas pueden conservar las respuestas antiguas; se abrió #147 para reconciliar correcciones persistidas de forma versionada e idempotente.
