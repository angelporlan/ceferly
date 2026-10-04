# Ciclo 15: README y GOAL_PROMPT alineados con el código

Issue: #116

Rama: `agent/docs-align-readme`

## Problema y alcance

El stack de React ya está corregido en README, pero el README raíz conserva afirmaciones incorrectas sobre ejercicios oficiales, niveles disponibles, facturación mensual, autenticación global y carga manual de seeds. `GOAL_PROMPT.md` debe fijar con claridad la precedencia del código y sus manifests sobre la documentación cuando describa la implementación.

Este ciclo cambia solo documentación. No modifica comportamiento, pagos, rutas ni contenido.

## Criterios de aceptación

- **AC-001**: README presenta los 108 ejercicios del catálogo como contenido original estilo Cambridge: 36 para cada nivel B1/B2/C1 y 27 para cada parte 1–4.
- **AC-002**: La explicación de Stripe coincide con `mode: "payment"` y la activación de 30 días; el desajuste conocido de URLs de retorno queda referido al issue #117.
- **AC-003**: Las secciones de API distinguen endpoints públicos, de autenticación obligatoria y opcional, según los routers actuales; no inventan un webhook.
- **AC-004**: La guía local describe la ejecución de migraciones/seeds según entorno y usa nombres de variables existentes.
- **AC-005**: `GOAL_PROMPT.md` dice que manifests, configuración y código ejecutable son fuente de verdad; README y `frontend/README.md` se mantienen alineados con ellos.
- **AC-006**: Las instrucciones del stack coinciden con los manifests y configuraciones actuales: React 19, TypeScript, Vite, Tailwind, Express, Sequelize/MySQL y Prisma Migrate.
- **AC-007**: Las afirmaciones de README sobre recompensas, racha, tienda y rankings reflejan `gamification.js`, `User.js` y `user.controller.js`.

## Invariantes

- **INV-001**: No se cambia código de aplicación ni configuración.
- **INV-002**: No se denomina oficial ni se copian materiales de Cambridge.
- **INV-003**: El README describe honestamente el desajuste de retorno de Stripe ya rastreado en #117, sin modificar su comportamiento.

## Plan

1. Contrastar las afirmaciones objetivo con `frontend/package.json`, Vite/Tailwind config y routers/controllers/backend startup.
2. Corregir únicamente `README.md` y la directriz de fuente de verdad en `GOAL_PROMPT.md`.
3. Revisar las rutas, cantidades, entorno y variables citadas contra el código y hacer `git diff --check`.
4. Abrir PR docs-only con `Closes #116`, self-review y CI.
