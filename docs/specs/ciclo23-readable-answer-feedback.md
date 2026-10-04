# Ciclo 23 — Soluciones compuestas legibles en ExercisePlayer

Issue: #139
Rama: `agent/fix-readable-answer-feedback`

## Problema y alcance

`ExercisePlayer` muestra la solución esperada después de un intento incorrecto con `String(correctAnswer)`. En ejercicios con un mapa de respuestas numeradas, el navegador convierte el objeto en `[object Object]`, ocultando al alumno la información que necesita para revisar el intento.

Este ciclo normaliza únicamente la presentación de la respuesta para el reproductor y el contexto de resultado. No cambia la puntuación ni los contratos de API.

## Requisitos

- **REQ-001** Las respuestas escalares MUST conservar su texto visible.
- **REQ-002** Los mapas de respuestas MUST mostrarse en un formato legible y con sus claves numéricas ordenadas de menor a mayor.
- **REQ-003** Los valores MUST conservar las alternativas aceptadas que ya contenga el catálogo, por ejemplo las separadas por `/`.
- **REQ-004** El reproductor MUST NOT mostrar la solución antes de comprobar una respuesta ni imprimir `[object Object]`, `undefined` o JSON crudo como solución.
- **REQ-005** Tests `node:test` sin dependencias nuevas MUST cubrir escalares, mapas con orden numérico y datos ausentes; el build frontend MUST pasar.
- **REQ-006** El feedback incorrecto MUST anunciarse con una región accesible de estado después de comprobar la respuesta.

## Invariantes y supuestos

- **INV-001** La solución solo se presenta en el feedback posterior a un intento incorrecto.
- **INV-002** La función de presentación no decide si una respuesta es correcta ni modifica el valor enviado al API.
- **ASSUMP-001** Las claves numéricas del objeto identifican los huecos del ejercicio y deben ordenarse numéricamente (`1`, `2`, `10`).
- **ASSUMP-002** Los textos del catálogo ya expresan sus alternativas aceptables; se conservan sin reescritura.

## Expectativas y criterios de aceptación

- **AC-001 / REQ-001:** una respuesta escalar como `"happiness"` se muestra exactamente como texto.
- **AC-002 / REQ-002, REQ-003:** `{ "10": "ten", "2": "two / second" }` se presenta como `2. two / second · 10. ten`.
- **AC-003 / REQ-004, INV-001:** el estado idle no muestra solución; al marcar una respuesta incorrecta se presenta la forma legible.
- **AC-004 / REQ-004:** `null`, `undefined` y mapas vacíos no producen `[object Object]`, `undefined` ni texto JSON.
- **AC-005 / REQ-005:** los tests de la función de formato pasan y `npm run build` genera el bundle frontend.
- **AC-006 / REQ-006:** el texto accesible de estado está vacío antes del intento y anuncia el feedback incorrecto con la solución legible después de comprobar.

## Plan

1. Añadir tests rojos de la función de formato para respuestas escalares y compuestas **(REQ-001–003; AC-001, AC-002)**.
2. Implementar el formateador puro con orden numérico determinista y tipos TypeScript **(REQ-001–004; AC-001–004)**.
3. Usar el formateador en el feedback incorrecto del reproductor y en el valor legible enviado a `/results`; anunciar el estado a lectores de pantalla **(REQ-004, REQ-006; AC-003, AC-004, AC-006)**.
4. Ejecutar tests frontend, build, lint dirigido y QA visual/accesible del player/resultados **(REQ-005; AC-005, AC-006)**.

## Verificación y evidencia

- **TDD:** `npm test` falló antes de crear `answerDisplay.mjs` con `ERR_MODULE_NOT_FOUND`; después pasa **14/14**.
- **Build:** `npm run build` — TypeScript y Vite pasan.
- **Lint:** ESLint dirigido a `ExercisePlayer.tsx`, `answerDisplay.mjs` y `answerDisplay.test.mjs` — pasa sin errores ni avisos. El build tipa también `answerDisplay.d.mts`.
- **Smoke visual/accesible:** con un mock local que devuelve un mapa de respuestas numeradas, `/exercises/139` no muestra la clave en estado idle; tras responder incorrectamente se ve `1. warmly / in a friendly way · 2. politely` y el árbol accesible recibe el estado `Respuesta incorrecta`. Continuar abre `/results`; la explicación de fallback mantiene el formato legible y no contiene JSON crudo.
- **Diff:** `git diff --check` — pasa.
- **Dependencias de QA:** `npm ci` instaló el lockfile. El comando informó 10 vulnerabilidades en dependencias instaladas (1 moderada, 9 altas); no se modificaron ni actualizaron dependencias en este ciclo.

## Seguimiento detectado

La revisión encontró que el player también trata ejercicios con múltiples huecos como una respuesta escalar y puede marcar un ejercicio completo como correcto tras responder un solo hueco. Se registra por separado en el issue #140; no se incorpora al alcance de este ciclo.
