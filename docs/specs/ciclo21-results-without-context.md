# Ciclo 21: resultado sin intento

Issue: #128

Rama: `agent/fix-results-empty-state`

## Problema y alcance

`/results` asume `isCorrect = true` cuando falta `location.state`. Abrir la ruta directamente fabrica un aprobado al 100% y permite pedir una explicación IA con datos genéricos. Este ciclo valida el contexto mínimo emitido por `ExercisePlayer` y ofrece navegación segura si no existe.

## Criterios de aceptación

- **AC-001**: Un resultado solo se considera válido si incluye `exerciseId` entero positivo e `isCorrect` booleano.
- **AC-002**: Sin contexto válido se muestra un mensaje y accesos a aprender/categorías, sin precisión, recompensas ni explicación IA.
- **AC-003**: Resultados válidos conservan el estado correcto/incorrecto, recompensas y flujo de explicación.
- **AC-004**: La recompensa `coins` se etiqueta como monedas.
- **AC-005**: Tests `node:test` integrados en CI validan contexto real y ausente/malformado sin dependencias nuevas.
- **AC-006**: Build frontend pasa y QA confirma la ruta directa y la navegación real.

## Invariantes

- **INV-001**: No cambian scoring, persistencia ni APIs de explicación.
- **INV-002**: No se afirma éxito sin resultado de un ejercicio.
- **INV-003**: No se muestran recompensas ni explicación para una ruta sin contexto.

## Plan

- [x] Añadir primero tests rojos del validador de contexto.
- [x] Mostrar un estado sin resultado cuando `location.state` no sea válido.
- [x] Ejecutar tests frontend, lint dirigido, build y smoke de la ruta.
- [ ] Actualizar changelog, subir commits semánticos y abrir la PR que cierre #128.
