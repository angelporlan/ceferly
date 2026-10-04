# Ciclo 8: inicializar Google Identity Services una sola vez

Issue: #101
Rama: `agent/fix-google-gsi-init`

## Problema y alcance

Al montar los formularios de login y registro, ambos llaman a `google.accounts.id.initialize()`. El SDK registra que se inicializó más de una vez y que solo conservará la configuración más reciente.

El ciclo convierte la configuración GSI en una inicialización única por configuración durante la vida de la aplicación. Cada montaje sigue renderizando su botón y el callback enruta la credencial al handler activo. El fallback de desarrollo se conserva.

## Criterios de aceptación

- **AC-001**: Navegar repetidamente entre login y registro no vuelve a inicializar GSI para el mismo client ID.
- **AC-002**: El callback llega al componente activo y conserva sus callbacks de éxito y error.
- **AC-003**: El botón oficial y el fallback siguen renderizándose según disponibilidad del SDK.
- **AC-004**: QA repetida de login/registro no reproduce el warning de inicialización múltiple.

## Invariantes

- **INV-001**: No cambian endpoints ni credenciales de OAuth.
- **INV-002**: No se almacena la credencial Google en estado global; el dispatcher conserva solo el handler activo.
- **INV-003**: No se silencia globalmente la consola ni se modifica la configuración de ESLint.

## Plan

1. Registrar la advertencia reproducible al navegar entre login y registro.
2. Añadir un dispatcher estable y mantener actualizado el handler del componente montado.
3. Evitar llamadas repetidas a `initialize` y renderizar el botón en cada montaje.
4. Revisar fallback y callbacks en QA del navegador; ejecutar lint y build.

## Evidencia

- El warning `google.accounts.id.initialize() is called multiple times` se reprodujo al alternar login/registro antes del cambio.
- `frontend npm run build`: correcto.
- `backend npm test`: 16/16.
- QA tras el cambio: cuatro transiciones entre login y registro; el botón oficial siguió apareciendo, el SDK no volvió a emitir el warning y la consola no registró warnings ni errores.
- `frontend npm run lint`: 14 errores preexistentes en archivos que aborda el issue #98, cero warnings. La PR #102 contiene su corrección independiente.
- El callback GSI usa el handler activo; no se inició una sesión real ni se enviaron credenciales durante QA.
