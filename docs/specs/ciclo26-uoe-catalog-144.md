# Ciclo 26: catálogo equilibrado de 144 ejercicios Use of English

Issue: #138
Rama: `agent/feat-uoe-catalog-144`

## Objetivo

Ampliar el catálogo original de Use of English para B1 Preliminary, B2 First y C1 Advanced de 108 a 144 ejercicios, equilibrando las cuatro partes de cada nivel.

## Criterios de aceptación

- Añadir 36 ejercicios originales: 12 por nivel y tres nuevos en cada parte.
- El catálogo queda con 48 ejercicios por nivel, 36 por parte y 12 por combinación nivel/parte.
- Cada registro tiene título único, respuesta, explicación pedagógica y el tipo de ejercicio asignado a su parte.
- Tests validan el total, las distribuciones, los títulos y los campos necesarios para el seeder.
- No se copian preguntas de exámenes oficiales ni se cambia el seeder o el esquema.

## Plan

1. Endurecer los tests de catálogo para exigir las distribuciones exactas y validar cada registro.
2. Confirmar que fallen con el catálogo actual de 108 ejercicios.
3. Añadir los 36 ejercicios con los constructores existentes para cada tipo/parte.
4. Ejecutar tests backend, build frontend requerido por CI y revisar `git diff --check`.

## Verificación local

- TDD rojo confirmado con el catálogo inicial: total 108 y 36 ejercicios por nivel, en vez de 144 y 48.
- `backend npm test`: 19/19.
- `frontend npm run build`: correcto.
- `git diff --check`: correcto.
- El test nuevo verifica respuestas válidas para opción múltiple, palabra clave de Part 4, respuestas de 2–5 palabras, explicaciones y títulos únicos.
- No se tocaron rutas UI ni la función de seeding; el catálogo se verifica sin base de datos.
- CI de la PR #141: `backend-test` y `frontend-build` pasan.

## Fuera de alcance

- C2 Proficiency, UI, cambios de esquema y cambios en la función de seeding.
