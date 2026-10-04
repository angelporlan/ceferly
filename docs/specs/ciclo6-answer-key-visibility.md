# Ciclo 6: ocultar claves antes del intento

Issue: #97
Rama: `agent/fix-answer-key-leak`

## Problema y alcance

Las rutas públicas `GET /api/exercises`, `GET /api/exercises/:id` y el modo aleatorio de listado serializan `correct_answer`. Un alumno puede leer la solución desde la respuesta de red antes de intentar el ejercicio.

El ciclo elimina la clave de las respuestas GET, mantiene el contenido necesario para practicar y conserva la corrección del servidor tras un envío autenticado. No cambia el middleware de autenticación ni añade persistencia.

## Requisitos

- **REQ-001**: Las respuestas de listado omiten `correct_answer` y `correctAnswer`.
- **REQ-002**: Las respuestas de detalle y aleatorias omiten ambos nombres de campo, incluso si el modelo devuelve la clave.
- **REQ-003**: Las respuestas GET conservan pregunta, opciones, textos, categoría/nivel y metadatos visibles usados por el reproductor.
- **REQ-004**: El endpoint autenticado de intento sigue devolviendo el resultado calculado por el servidor; puede incluir la respuesta esperada solo después de guardar el intento para que el reproductor conserve la corrección posterior.
- **REQ-005**: El cliente no calcula aciertos usando una clave recibida antes del envío. Sin sesión, permite leer el ejercicio y muestra acceso a iniciar sesión al comprobar.

## Criterios de aceptación y verificadores

- **AC-001**: Dado un listado con una clave ficticia, el JSON de listado no contiene `correct_answer` ni `correctAnswer`, y conserva pregunta/opciones. Verificador: test de controlador.
- **AC-002**: Dado un ejercicio con clave ficticia, los modos de detalle y aleatorio no exponen la clave. Verificador: tests de controlador para ambas rutas.
- **AC-003**: Tras enviar una respuesta con sesión, el resultado de scoring sigue llegando y el reproductor puede mostrar la solución después del envío. Verificador: test de intento y QA UI.
- **AC-004**: Sin sesión, el reproductor no muestra solución ni calcula un resultado local; ofrece iniciar sesión. Verificador: inspección del estado de UI/QA.
- **AC-005**: Las rutas principales de ejercicio mantienen texto y navegación a resultados. Verificador: build y QA UI.

## Invariantes de seguridad

- **INV-001**: Ninguna respuesta GET de ejercicio contiene la clave de respuesta, incluida una clave vacía o serializada como objeto.
- **INV-002**: La puntuación sigue siendo responsabilidad del backend autenticado.
- **INV-003**: La respuesta esperada solo puede aparecer en el flujo de corrección posterior al intento autorizado.
- **INV-004**: No se escriben ni borran datos de usuario ni se modifica el esquema.

## Supuestos y riesgos

- **ASSUMP-001**: El reproductor puede seguir permitiendo navegación y lectura sin sesión, pero comprobar una respuesta requiere iniciar sesión porque la ruta de intento ya exige autenticación.
- **RISK-001**: Los visitantes sin sesión pierden la corrección local que dependía de la clave pública; se muestra un enlace de acceso y el flujo autenticado se conserva.
- No requiere migración. Reversión: revertir el commit del ciclo.

## Plan

1. Añadir tests de regresión de listado, detalle y modo aleatorio que fallen con el código actual.
2. Introducir serialización pública que excluya la clave y dejar de seleccionarla en listados/detalle.
3. Retornar la clave solo en la respuesta autenticada posterior al envío y actualizar el reproductor para usar scoring del servidor.
4. Añadir el estado de acceso requerido para visitantes sin sesión.
5. Ejecutar suite backend, build y lint focalizado; QA visual del flujo autenticado y del estado sin sesión.

## Evidencia

- TDD: los tests nuevos de listado, detalle y aleatorio fallaron con la implementación anterior por exponer o seleccionar la clave.
- `backend npm test`: 19/19.
- `frontend npm run build`: correcto.
- `npx eslint src/pages/ExercisePlayer.tsx`: correcto. El lint completo sigue reportando errores previos en ficheros no tocados, ya asociados al issue #98.
- Smoke HTTP sobre el servidor local: `GET /exercises`, `GET /exercises/:id` y `GET /exercises?random=true` devolvieron 200 y no incluyeron recursivamente `correct_answer`/`correctAnswer`; `POST /exercises/:id/attempt` sin token devolvió 401.
- QA UI en Chrome: en invitado, el ejercicio y la pregunta siguen visibles y comprobar muestra el enlace de inicio de sesión sin solución. Con una cuenta sintética de la BD desechable, una respuesta incorrecta redujo vidas de 5 a 4, mostró la solución `must` tras el POST y navegó a `/results`; no hubo errores de consola.
- La base MySQL y la cuenta de QA vivieron solo en el contenedor desechable creado para este ciclo; el contenedor, los servidores locales y la sesión del navegador se cerraron al terminar.
