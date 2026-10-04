# Ciclo 32: validar enteros en `daily_goal`

Issue: #152
Rama: `agent/fix-daily-goal-integer-validation`
Base: `origin/main` en `e64bcee`.

## Problema y alcance

`PUT /users/me/daily-goal` comprueba que el valor esté entre 1 y 100, pero JavaScript compara decimales y coerciona strings numéricos. El modelo MySQL usa una columna entera, por lo que una entrada como `1.5` podría terminar guardada truncada o producir un resultado distinto del valor enviado. Además, la ruta requiere autenticación y la preferencia pertenece al usuario.

El ciclo restringe el endpoint a valores JSON de tipo number que sean enteros entre 1 y 100 inclusive. Las entradas inválidas responden 400 y no cambian el valor persistido. La ruta, autenticación y respuesta exitosa existente permanecen iguales.

## Requisitos e invariantes

- **REQ-001**: Aceptar solo enteros JSON del 1 al 100, inclusive.
- **REQ-002**: Rechazar con 400 valor ausente, `null`, string, decimal, booleano, array, objeto o entero fuera de rango.
- **REQ-003**: Una petición rechazada no debe guardar ni alterar `daily_goal`.
- **REQ-004**: Una petición válida conserva el estado 200 y la forma de respuesta exitosa actual.
- **REQ-005**: Mantener `/users/me/daily-goal` y su middleware de autenticación sin cambios.
- **INV-001**: No cambiar esquema, frontend, racha ni otras preferencias del usuario.
- **INV-002**: No convertir/coaccionar tipos de entrada.

## Criterios de aceptación

- [x] Los valores 1 y 100 se guardan y se devuelven correctamente; un entero interior también se acepta.
- [x] Cada tipo/valor inválido responde 400.
- [x] Tras cada rechazo, la base conserva el `daily_goal` anterior.
- [x] Una petición sin token sigue respondiendo 401 y no modifica al usuario.
- [x] Los tests de endpoint pasan con migraciones en MySQL desechable; la suite backend completa pasa 39/39.
- [x] El diff no contiene cambios de UI, esquema ni rutas/autorización.
- [x] La PR lleva la etiqueta `needs-human-review` porque cambia datos persistidos de usuario.

## Plan

1. [x] Confirmar contrato, controlador, ruta autenticada y harness HTTP/MySQL existente.
2. [x] Añadir regresiones de endpoint para límites, tipos, persistencia y autenticación; comprobar que fallan antes del fix (un string numérico se guardó como 5; body ausente respondió 500).
3. [x] Añadir validación estricta sin coerción y conservar la respuesta exitosa.
4. [x] Ejecutar test focalizado y suite backend (39/39) con migraciones en MySQL aislado; revisar el flujo HTTP.
5. [x] Crear PR vinculada a #152, etiquetar `needs-human-review` y publicar self-review.
6. [x] Esperar CI verde: 2 ejecuciones de backend-test y 2 de frontend-build.

## Verificación final

- Antes del fix, el test HTTP confirmó que `daily_goal: "5"` persistía como 5 y que un body ausente respondía 500.
- Después del fix, el test de endpoint y la suite backend completa pasan: 39/39, con las migraciones Prisma aplicadas en MySQL desechable.
- CI de PR #154: 2 ejecuciones de backend-test y 2 de frontend-build, todas verdes.
- La PR está etiquetada `needs-human-review`; no se cambian esquema, UI, ruta ni middleware.

## Riesgos

El endpoint modifica una preferencia persistida. La validación es deliberadamente estricta y reversible; los valores inválidos dejarán de llegar a Sequelize/MySQL. No se modifica autenticación ni datos de otros usuarios.
