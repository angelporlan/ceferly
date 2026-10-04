# Ciclo 16: Alinear retornos de Stripe con rutas React

Issue: #117

Rama: `agent/fix-stripe-return-urls`

## Problema y alcance

Stripe Checkout redirige a `/success` y `/cancel`, pero React solo declara `/payment/success` y `/payment/cancel`. El fallback de React hace que el navegador no llegue a `PaymentSuccess`, que envía `session_id` a `/api/payments/verify-session`.

El ciclo cambia las URLs de retorno para usar las rutas ya existentes y verifica la generación de URLs sin acceder a Stripe ni mutar usuarios.

## Criterios de aceptación

- **AC-001**: Los retornos de éxito y cancelación usan rutas existentes en `frontend/src/App.tsx`.
- **AC-002**: `success_url` conserva el marcador `{CHECKOUT_SESSION_ID}` en el query param `session_id`.
- **AC-003**: Un test unitario del constructor de URLs valida la salida para la URL de frontend configurada y no instancia ni llama a Stripe.
- **AC-004**: El flujo de cancelación solo navega a `PaymentCancel`; no llama a `verify-session` ni cambia el rol.

## Invariantes

- **INV-001**: No cambian precios, productos, metadatos, duración del acceso ni verificación del pago.
- **INV-002**: No se envían requests reales a Stripe en el test.
- **INV-003**: No se modifica el rol cuando la sesión se cancela.

## Plan

1. Añadir primero un test rojo para las URLs de éxito y cancelación.
2. Extraer un helper puro de retorno y usarlo en ambas sesiones de Checkout.
3. Ejecutar el test nuevo, suite backend y build frontend; revisar manualmente rutas React y cancel page.
4. Registrar el ciclo y abrir PR `Closes #117` con self-review y CI.
