# Ciclo 28 — Puntuar cada hueco en ejercicios compuestos

Issue: [#140](https://github.com/angelporlan/ceferly/issues/140)

Rama: `agent/fix-multigap-exercise-scoring`

## Problema y objetivo

Los ejercicios `word_formation` y `key_word_transformation` incluyen varios huecos numerados, pero el jugador actual solo recoge una respuesta. El cliente manda `totalGaps: 1` y el servidor aplana el mapa de soluciones, así que una palabra correcta para otro hueco puede aprobar una respuesta mal asignada.

El jugador debe recopilar cada respuesta con su número visible y enviar un mapa numerado. El servidor debe comparar cada valor solo con la solución de ese hueco, persistir el mapa y el recuento correcto y aprobar solo cuando todos los huecos requeridos estén bien.

## Alcance y decisiones

- El número y el total de huecos se derivan de marcadores `(N)` seguidos por una línea de puntos o guiones bajos en el enunciado; nunca del mapa de respuestas ocultas.
- Los mapas de soluciones con claves numéricas son la fuente autoritativa del total y del orden de huecos en scoring.
- Las alternativas separadas por `/`, espacios y capitalización siguen la normalización actual.
- Las respuestas escalares de ejercicios existentes conservan el scoring binario. Un mapa de un solo hueco acepta además el escalar legado.
- Una respuesta parcial persiste `correct_gaps`, `total_gaps` y porcentaje redondeado; no se concede la recompensa reservada a respuestas totalmente correctas.
- Ocultar las respuestas antes del intento (#97), explicar mapas en el feedback (#139), contenido, pagos y cambios de recompensa quedan fuera.

## Requisitos

- **REQ-001** El jugador MUST mostrar un campo etiquetado por cada marcador numerado del enunciado compuesto.
- **REQ-002** El jugador MUST enviar un objeto `{ "1": "...", "2": "..." }` para esos ejercicios y no permitir comprobar mientras falte una respuesta.
- **REQ-003** El servidor MUST derivar el total de la solución numérica, comparar cada respuesta solo con la solución de la misma clave y contar aciertos parciales.
- **REQ-004** El servidor MUST marcar el intento completamente correcto solo si todas las claves requeridas coinciden, y MUST persistir mapa y conteos coherentes.
- **REQ-005** Las soluciones escalares y los intentos heredados de un solo hueco MUST conservar compatibilidad.
- **REQ-006** Tests sin dependencias nuevas MUST cubrir los huecos, las alternativas, respuestas parciales y valores correctos colocados en el hueco equivocado; el build frontend MUST pasar.

## Criterios de aceptación

- **AC-001 / REQ-001:** con los marcadores `(1) …` y `(2) …`, el jugador renderiza dos entradas accesibles y numeradas.
- **AC-002 / REQ-002:** no se puede comprobar con un campo vacío; las respuestas recortadas se envían asociadas a sus números y la continuación conserva el mismo objeto para `/results`.
- **AC-003 / REQ-003:** para tres claves, dos aciertos y un error producen `totalGaps: 3`, `correctGaps: 2`, `score: 67` y `isFullyCorrect: false`, incluso si el cliente manda un total distinto.
- **AC-004 / REQ-003, REQ-004:** una respuesta que coincide con otra clave no suma para la clave asignada; únicamente todas las claves correctas dan 100 y estado totalmente correcto.
- **AC-005 / REQ-005:** las pruebas escalares existentes siguen pasando y un mapa de una clave admite el escalar antiguo.
- **AC-006 / REQ-006:** pasan tests de backend y frontend, build TypeScript/Vite y QA de la ruta del jugador.

## Plan

1. Añadir tests rojos del helper frontend y de scoring backend para mapas por número **(REQ-002–006; AC-002–005)**.
2. Implementar la extracción de huecos visibles y renderizar/validar/resumir las respuestas numeradas **(REQ-001, REQ-002; AC-001, AC-002)**.
3. Cambiar scoring para comparar por clave, derivar conteos y porcentaje desde la solución y conservar compatibilidad escalar **(REQ-003–005; AC-003–005)**.
4. Ejecutar tests, build y QA visual/HTTP del jugador; registrar evidencia y revisar diff **(REQ-006; AC-006)**.

## Verificación y evidencia

- **TDD frontend:** `node --test test/exerciseGapAnswers.test.mjs` falló inicialmente con `ERR_MODULE_NOT_FOUND`; tras añadir el helper, 3/3 casos pasan. Se cubren extracción numérica ordenada/deduplicada, referencias que no son huecos, recorte de respuestas y bloqueo si falta una.
- **TDD backend:** los cuatro casos nuevos de `node --test test/scoring.test.js` fallaron antes del cambio (mapa completo, parcial, claves intercambiadas y escalar legado); después, scorer 6/6.
- **Tests frontend:** `npm test` — 14/14.
- **Lint dirigido:** `npx eslint src/pages/ExercisePlayer.tsx src/lib/exerciseGapAnswers.mjs src/lib/resultContext.mjs test/exerciseGapAnswers.test.mjs test/resultContext.test.mjs` — OK.
- **Build:** `npm run build -- --outDir /private/tmp/ceferly-build-cycle28-qa` — TypeScript y Vite OK.
- **Tests backend:** `npm test` — 26/26 contra MySQL desechable aislado en el puerto `3314`, con las tres migraciones Prisma aplicadas. Incluye la persistencia del mapa parcial (`2/3`, score `67`, completo `false`).
- **QA UI con API mock local:** renderiza dos campos etiquetados, mantiene Comprobar deshabilitado hasta completar ambos, envía `{"userAnswer":{"1":"finished","2":"wrong"},"totalGaps":2}`, consume respuesta parcial/no completa y continúa a `/results` con contexto válido.
- **Inventario de contenido:** todos los marcadores detectados coinciden con claves numéricas de respuestas en Word Formation (26/26), Key Word Transformation (30/30) y Conditionals (20/20).
- **GitHub:** issue #140 estaba abierto y sin branch ni PR antes de crear esta rama.

## Riesgos y reversión

Los ejercicios compuestos deben mantener marcadores visibles con el mismo número que las claves del mapa de respuestas. Si un enunciado no tiene marcadores detectables, el jugador conserva la entrada escalar y el scoring del servidor continúa usando la ruta heredada. El cambio no altera esquema de base de datos.
