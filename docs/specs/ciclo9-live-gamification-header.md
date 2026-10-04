# Ciclo 9: recompensas sincronizadas y badges de racha

Issue: #104
Rama: `agent/feat-live-gamification-header`

## Problema y alcance

El `Header` forma parte del `AppLayout` y permanece montado al navegar entre las rutas. Consulta `/users/me` al montarse, por lo que no refleja intentos ni compras posteriores. El player tampoco muestra el valor de `coinsDelta` que devuelve el servidor. Se publicarán actualizaciones pequeñas de stats desde los flujos de intento y tienda; el servidor sigue siendo la fuente de verdad.

El Header mostrará un badge compacto para los hitos de racha de 3, 7 y 30 días. No se añaden datos persistidos ni cambian las reglas de recompensas.

## Criterios de aceptación

- **AC-001**: Tras un intento guardado, el Header actualiza monedas, vidas y racha con los valores de `rewards` del servidor, sin recargar.
- **AC-002**: Tras una compra guardada, el Header actualiza monedas y vidas con la respuesta del servidor, sin recargar.
- **AC-003**: El feedback del intento informa las monedas realmente recibidas (`coinsDelta`); un intento sin guardar no anuncia una recompensa.
- **AC-004**: El Header muestra el hito de racha más alto alcanzado entre 3, 7 y 30 días y conserva un nombre accesible.
- **AC-005**: Tests unitarios, ESLint focalizado en los archivos modificados y build de frontend pasan. El lint global sigue pendiente del issue #98.

## Invariantes

- **INV-001**: Ninguna recompensa se calcula en frontend; se consume solo la respuesta del servidor.
- **INV-002**: Los eventos de stats solo actualizan campos presentes y no borran nombre, nivel u otros datos del Header.
- **INV-003**: No cambian rutas, autenticación, almacenamiento ni esquema de datos.

## Plan

1. Escribir tests para publicación/escucha de stats, merge parcial e hitos de racha.
2. Añadir un pequeño dispatcher de eventos tipado y conectar Header, player y tienda.
3. Mostrar el `coinsDelta` real en el feedback del player.
4. Ejecutar tests, lint y build; hacer QA de intento, tienda y Header en navegador.
5. Revisar cambios, publicar PR enlazada al issue y añadir self-review.
