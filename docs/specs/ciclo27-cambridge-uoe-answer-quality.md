# Ciclo 27 — Correcciones editoriales de Use of English (#142)

## Por qué

La revisión del catálogo detectó dos respuestas problemáticas: una pregunta C1 con dos opciones que completan naturalmente la frase y una transformación B2 cuya primera alternativa supera el límite de cinco palabras.

## Alcance

Corregir C1 Advanced Use of English Part 1 #1 y B2 First Part 4 #7. Mantener los constructores y el seeder actuales; no añadir ejercicios ni cambiar la interfaz.

## Criterios de aceptación

- [ ] C1 Part 1 #1 tiene un contexto preciso, una sola opción natural y distractores claramente incorrectos.
- [ ] B2 Part 4 #7 conserva la keyword PREFER, expresa el mismo significado y cada respuesta aceptada tiene entre 2 y 5 palabras.
- [ ] Tests de regresión verifican las opciones de la pregunta C1 y el límite/keyword de la transformación B2.

## Plan

1. [x] Añadir regresiones antes de cambiar el catálogo y confirmar que fallan.
2. [x] Corregir solo los dos ítems y sus explicaciones.
3. [x] Ejecutar tests del catálogo (4/4), suite backend (18/23; cinco fallos por MySQL local no disponible) y build frontend (correcto); inspeccionar el diff y las respuestas completas.
4. [x] QA UI no aplica: el cambio solo afecta contenido. Review independiente aprobado; registrar resultado y follow-up en `AGENT_CHANGELOG.md`.

## Riesgos y límites

Las validaciones automáticas fijan las opciones y el contrato de palabras; la corrección semántica requiere revisión editorial. El cambio no cubre otros posibles problemas del catálogo.
