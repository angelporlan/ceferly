# Ciclo 7: resolver deuda de ESLint

Issue: #98
Rama: `agent/fix-eslint-debt`

## Problema y alcance

La ejecución de referencia de `frontend/npm run lint` falla con 16 errores y 1 warning en auth, layout, dashboard y ranking. El CI de frontend compila, pero no ejecuta ESLint.

El ciclo corrige los tipos, dependencias de hooks y manejo de errores en los archivos señalados. No cambia reglas de ESLint ni introduce cambios de producto; conserva el contrato y los estados visibles existentes salvo un mensaje de recuperación cuando falla la petición de contraseña.

## Criterios de aceptación

- **AC-001**: `frontend/npm run lint` termina sin errores ni warnings.
- **AC-002**: Se mantiene la configuración actual de ESLint y no se añade `any` explícito.
- **AC-003**: El build frontend y la suite backend existente siguen pasando.
- **AC-004**: Los cambios de tipado preservan los contratos de APIs usados por las pantallas.
- **AC-005**: El job frontend de CI ejecuta `npm run lint` y `npm run build`.

## Invariantes

- **INV-001**: Se conservan las reglas actuales de ESLint.
- **INV-002**: Los fallos de autenticación mantienen un mensaje de usuario mediante `unknown` seguro.
- **INV-003**: La recuperación de contraseña mantiene un mensaje neutral que no confirma si una cuenta existe.
- **INV-004**: No cambian rutas, persistencia, autenticación del backend ni esquema de datos.

## Plan

1. Registrar el fallo base de ESLint y mapear cada diagnóstico a su causa.
2. Sustituir `any` por respuestas/API tipadas y errores `unknown`.
3. Quitar la actualización sincrónica de estado en el efecto de `Header` y completar dependencias del callback GSI.
4. Manejar explícitamente el fallo de red del formulario de recuperación sin revelar existencia de cuentas.
5. Añadir ESLint al job frontend de CI para bloquear nuevas regresiones.
6. Ejecutar ESLint completo, build y suite backend; revisar el diff.

## Evidencia

- Baseline reproducido antes de editar el ciclo: `npm run lint` falló con 16 errores y 1 warning. Tras sincronizar con `main` en `bbdfbd1`, el baseline previo a este cambio era de 10 errores y 0 warnings.
- `frontend npm run lint`: correcto, sin errores ni warnings; no quedan usos explícitos de `any` en `frontend/src`.
- `frontend npm test`: 24/24; `frontend npm run build`: correcto.
- `backend npm test`: 42/42, con las cuatro migraciones aplicadas en un MySQL desechable.
- El job `frontend-build` de CI ejecuta tests, ESLint y build.
- QA local tras sincronizar: `/login`, `/register` y `/forgot-password` cargan y exponen sus controles y enlaces. No se enviaron formularios. La consola muestra `[GSI_LOGGER]: The given origin is not allowed for the given client ID` en `127.0.0.1`; el client ID local no autoriza ese origen. La inicialización duplicada de GSI ya está cubierta por el follow-up #101.
- El CI de esta revisión queda pendiente de la sincronización publicada de la rama.
