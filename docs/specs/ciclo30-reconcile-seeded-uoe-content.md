# Ciclo 30: reconciliar contenido UoE ya sembrado

Issue: #147
Rama: `agent/fix-seeded-uoe-content`

## Problema y alcance

`seedCambridgeUseOfEnglish` usa `findOrCreate` y no sobrescribe filas existentes completas. Al cambiar el catálogo fuente, una base ya sembrada puede conservar respuestas anteriores. Este ciclo añade una migración Prisma versionada para las correcciones de B1 Part 4 #3 y #5 de #143.

## Criterios de aceptación

- La migración actualiza la solución de #3 a `is of interest to`.
- La migración actualiza #5 al enunciado `The match ______ the rain.` y la solución `was cancelled because of`.
- Cada `UPDATE` requiere el título y los valores antiguos exactos; si el contenido fue modificado por una persona, se deja intacto.
- La operación no cambia IDs, intentos, respuestas enviadas, puntuaciones ni progreso.
- Volver a ejecutar el SQL no cambia los registros ya corregidos.
- Tests de integración verifican los valores corregidos, la idempotencia y la conservación de intentos asociados.

## Plan

1. Crear un test rojo que prepara filas antiguas y sus intentos dentro de una transacción.
2. Añadir una migración Prisma con `UPDATE` condicional por título y contenido antiguo.
3. Ejecutar la migración dos veces dentro de la transacción de prueba y comparar estado e intentos.
4. Ejecutar la suite backend, tests/build frontend y revisar el SQL y diff.

## Riesgos y reversión

- Los filtros exactos evitan sobreescribir ediciones que ya no coinciden con el contenido antiguo esperado.
- La migración es de avance; para revertir, una migración posterior restauraría únicamente los valores de estos registros. No se eliminan filas.

## Estado inicial

- El issue #147 ya existía y estaba abierto; no se creó otro issue.
- La fuente confirma que el seeder no actualiza filas existentes completas.

## Verificación

- TDD rojo: el test de integración falló al inicio porque aún no existía la migración indicada.
- TDD verde: el test aplica la migración dos veces en la misma transacción y confirma contenido, IDs, intentos y una fila editada manualmente que debe quedar intacta.
- Backend completo: 29/29 tests contra MySQL temporal aislado, con `origin/main` actualizado y todas las migraciones aplicadas.
- Frontend: 16/16 tests y `npm run build` correctos.
- QA UI: no aplica; este ciclo solo cambia persistencia y documentación.
