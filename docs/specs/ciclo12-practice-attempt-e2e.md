# Ciclo 12: E2E HTTP del intento de práctica

Issue: #110
Rama: `agent/test-practice-attempt-e2e`

## Problema y alcance

Las pruebas del backend cubren servicios aislados. Este ciclo añade una prueba automatizada que cruza registro, catálogo y envío de un intento por el servidor Express real, y comprueba los efectos persistidos en la base de test de CI.

## Criterios de aceptación

- **AC-001**: La prueba obtiene un token mediante el endpoint HTTP de registro.
- **AC-002**: Niveles, categorías y ejercicios se consultan por rutas HTTP usando fixtures deterministas.
- **AC-003**: Un intento correcto devuelve puntuación y recompensas; su historial y los datos del usuario confirman la persistencia.
- **AC-004**: La respuesta correcta se define en el fixture de prueba; la prueba no usa claves de respuesta leídas del catálogo.
- **AC-005**: La prueba elimina sus intentos, usuario y fixtures y queda incluida en el job `backend-test` existente.

## Invariantes

- **INV-001**: No se modifican reglas de puntuación, recompensas ni esquema.
- **INV-002**: La aplicación Express puede importarse en tests sin iniciar el servidor ni ejecutar seeds de desarrollo.
- **INV-003**: Ninguna integración de Google, correo, pagos o IA se invoca durante el flujo.

## Plan

1. Escribir primero una prueba roja que use un listener HTTP real, registro y fixtures de base de datos.
2. Separar la construcción de Express del arranque y la inicialización de desarrollo en `server.js`.
3. Verificar catálogo, intento, historial y persistencia; limpiar los datos del test incluso si falla.
4. Ejecutar la suite de backend, el build frontend y el diff check; CI reutiliza el job de backend existente.
5. Publicar una PR con self-review y enlazar el issue #110.
