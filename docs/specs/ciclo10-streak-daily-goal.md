# Ciclo 10: avanzar la racha al cumplir la meta diaria

Issue: #106
Rama: `agent/fix-streak-daily-goal`

## Problema y alcance

`recordExerciseAttempt` aplica la racha en el primer intento del día, mientras que el Dashboard indica que hay que completar `daily_goal` ejercicios. El helper `updateStreakWhenDailyGoalReached` del controlador no se llama. La racha se calculará al alcanzar el objetivo de intentos guardados de ese día, usando el mismo límite de día UTC del endpoint de progreso.

## Criterios de aceptación

- **AC-001**: Los intentos guardados por debajo de `daily_goal` conservan `streak` y `last_completed_date`.
- **AC-002**: Al alcanzar `daily_goal`, la racha se actualiza una vez: continúa si la última meta fue ayer; en otro caso comienza en 1.
- **AC-003**: Intentos adicionales del mismo día no incrementan más la racha.
- **AC-004**: El intento devuelve la racha persistida y mantiene las reglas actuales de monedas y vidas.
- **AC-005**: Tests unitarios y de servicio cubren umbral, repetición y continuidad entre días; suite backend y build de frontend pasan.

## Invariantes

- **INV-001**: Solo cuentan intentos persistidos por el usuario.
- **INV-002**: El cálculo del día usa UTC como `getNumberOfAttemptsToday`.
- **INV-003**: No hay migración ni cambio en cómo se define un intento.

## Plan

1. Añadir tests fallidos para debajo del objetivo, alcanzar objetivo, repetición y día consecutivo.
2. Contar intentos del día tras guardar el intento y aplicar el umbral de `daily_goal` al helper de racha.
3. Añadir cobertura de persistencia en el servicio y ejecutar la suite completa.
4. Revisar diff, publicar PR con etiqueta `needs-human-review` y hacer self-review.
