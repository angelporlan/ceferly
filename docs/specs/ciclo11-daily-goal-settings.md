# Ciclo 11: editar la meta diaria desde Dashboard

Issue: #108
Rama: `agent/feat-daily-goal-settings`

## Problema y alcance

El Dashboard muestra el progreso diario, pero la meta solo se puede modificar mediante el endpoint autenticado `PUT /users/me/daily-goal`. La tarjeta permitirá editarla sin salir de la ruta y reflejará únicamente la respuesta guardada por el servidor.

## Criterios de aceptación

- **AC-001**: Una persona autenticada puede editar `daily_goal` con un entero entre 1 y 100.
- **AC-002**: Tras guardar, meta, progreso y mensaje usan el valor devuelto por el servidor sin recargar.
- **AC-003**: Valores inválidos, errores HTTP o de red conservan la última meta guardada y muestran feedback accesible.
- **AC-004**: A visitantes se les ofrece iniciar sesión; no se envía una petición de actualización.
- **AC-005**: Tests cubren los límites; lint focalizado y build frontend pasan.

## Invariantes

- **INV-001**: El servidor sigue siendo fuente de verdad; no se escribe una meta optimista en estado persistido.
- **INV-002**: Solo se envía el campo `daily_goal` y se mantiene el endpoint autenticado existente.
- **INV-003**: No cambian reglas de racha, endpoints ni esquema.

## Plan

1. Escribir tests fallidos para validar 1, 100, decimales y valores fuera de rango.
2. Añadir la validación compartida y un editor accesible dentro de la tarjeta actual.
3. Conectar con `PUT /users/me/daily-goal`, manejar respuestas y preservar el valor previo ante error.
4. Ejecutar tests, ESLint focalizado y build; QA de estados invitado y autenticado.
5. Publicar PR marcada `needs-human-review` porque cambia una preferencia persistida.
