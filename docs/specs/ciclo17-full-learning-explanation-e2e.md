# Ciclo 17: E2E integrado desde registro hasta explicación

Issue: #120

Rama: `agent/test-full-learning-explanation-e2e`

## Problema y alcance

Los E2E existentes recorren autenticación/catálogo/intento y explicación persistida en tests distintos. Este ciclo recorre con un solo usuario registrado el catálogo, el detalle del ejercicio, el intento, el resultado y la explicación mediante los routers HTTP reales.

El fallback determinista de `explanation_rule` mantiene la prueba independiente de proveedores externos. El test monta un Express efímero y no importa `server.js` ni ejecuta seeds.

## Criterios de aceptación

- **AC-001**: La prueba registra al usuario por HTTP y usa el JWT de registro en los pasos posteriores.
- **AC-002**: Consulta nivel, categoría, lista y detalle del ejercicio de prueba por HTTP.
- **AC-003**: Crea un intento, consulta su resultado y pide la explicación para ese mismo intento con el mismo JWT.
- **AC-004**: La respuesta usa el fallback del fixture y persiste la fila `AttemptExplanation`, sin invocar proveedores externos.
- **AC-005**: Se limpian usuario, intentos, uso diario, explicación y fixtures; CI descubre el test en `backend-test`.

## Invariantes

- **INV-001**: No cambia el comportamiento de autenticación, scoring, pagos ni proveedores.
- **INV-002**: No se utiliza una cuenta, base de datos ni clave real.
- **INV-003**: La petición de explicación pertenece al usuario que creó el intento.

## Plan

1. Escribir un test rojo del flujo completo con fixtures únicos.
2. Montar `authRoutes`, `exerciseRoutes`, `exerciseAttemptRoutes` y `aiRoutes` en un listener temporal.
3. Ejecutar registro → nivel/categoría → lista/detalle → intento → resultado → explicación; comprobar persistencia/fallback y bloquear la salida de red.
4. Ejecutar suite backend y build frontend sobre MySQL temporal, revisar diff y abrir PR `Closes #120`.
