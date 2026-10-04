# Ciclo 14: E2E HTTP de explicación IA persistida

Issue: #114
Rama: `agent/test-ai-explanation-e2e`

## Problema y alcance

La explicación y su caché tienen pruebas de servicio, pero todavía no se recorre el endpoint autenticado junto con un intento persistido, la cuota diaria y la fila `AttemptExplanation`. Este ciclo cubre esa ruta HTTP con el fallback de `explanation_rule`, sin invocar proveedores externos.

## Criterios de aceptación

- **AC-001**: Una petición autenticada del propietario genera explicación para un intento persistido.
- **AC-002**: Sin credenciales de proveedor, la respuesta deriva de la regla pedagógica del fixture y no realiza llamadas externas.
- **AC-003**: La explicación queda persistida y la repetición responde desde caché sin incrementar de nuevo `AiUsageDaily`.
- **AC-004**: Otro usuario no puede recuperar la explicación del intento.
- **AC-005**: El test limpia usuarios, intentos, explicación, cuota y contenido creado; CI lo descubre en `backend-test`.

## Invariantes

- **INV-001**: No se cambian prompts, proveedores, límites, puntuación ni esquema.
- **INV-002**: El test monta los routers HTTP reales y usa JWT/DB de test; no importa `server.js` ni inicia seeds.
- **INV-003**: El proveedor externo permanece deshabilitado durante todo el proceso de test.

## Plan

1. Escribir tests rojos para la ruta autenticada, caché y aislamiento entre usuarios.
2. Montar `exerciseAttemptRoutes` y `aiRoutes` en un listener Express efímero dentro del test.
3. Crear un intento vía HTTP, solicitar explicación por HTTP y validar persistencia/uso; repetir y probar acceso ajeno.
4. Ejecutar suite backend, build frontend y diff check sobre una base MySQL temporal.
5. Publicar una PR con self-review y enlazar el issue #114.
