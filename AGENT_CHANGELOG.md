# AGENT CHANGELOG

## [Ciclo 1] - Conexión End-to-End de Ejercicios, Categorías, Player y Tutor IA (Gemini Flash 3.5)

### Resumen del Ciclo
En este ciclo se resolvió la desconexión crítica entre la base de datos de ejercicios reales (991 ejercicios en MySQL) y la interfaz de usuario en React 19, haciendo que toda la experiencia de usuario funcione de extremo a extremo sin datos falsos ni fallbacks vacíos.

### Cambios Realizados
1. **Rutas y Middleware de Autenticación**:
   - Creado `optionalAuthenticate` en `backend/src/middlewares/auth.middleware.js`.
   - Aplicado en `exercise.routes.js` y `user.routes.js` para permitir la consulta pública/opcional de categorías, subcategorías, listado de ejercicios y rankings.
2. **Controlador de Ejercicios & Categorías (`exercise.controller.js`)**:
   - Corregido `getCategories` para incluir la asociación `Subcategory`, mapeando nombre y descripción oficial para Cambridge B2/C1.
   - Corregido `getExercises` para soportar filtro por `subcategoryId` y `subcategory_id`, evitando errores por usuarios no autenticados (`req.user?.id`).
   - Normalizados los campos devueltos en `getExercises` y `getExerciseById` (soporte simultáneo de `questionText` y `question_text`, `correctAnswer` y `correct_answer`, `readingText`, `options`).
3. **Persistencia de Intentos (`exerciseAttempt.controller.js`)**:
   - Normalizados los parámetros recibidos (`userAnswer` / `user_answer`, `totalGaps` / `total_gaps`, `correctGaps` / `correct_gaps`, `isFullyCorrect` / `is_fully_correct`, `score`) para persistir intentos reales en la tabla `user_exercise_attempts`.
4. **Tutor de IA con Gemini Flash 3.5 (`explanation.controller.js` & `ai.routes.js`)**:
   - Montado endpoint directo `POST /api/ai/explain` y `POST /api/explain`.
   - Conectada la corrección pedagógica en vivo con `gemini-3.5-flash` a través del SDK `@google/genai`.
5. **Frontend React 19 (`Categories.tsx`, `ExercisesList.tsx`, `ExercisePlayer.tsx`, `ResultsPage.tsx`, `Dashboard.tsx`, `Leaderboard.tsx`)**:
   - `Categories.tsx`: carga y muestra el catálogo completo de categorías y subcategorías reales.
   - `ExercisesList.tsx`: desempaqueta la lista paginada de ejercicios de cada subcategoría.
   - `ExercisePlayer.tsx`: valida respuestas inteligentes (incluyendo variaciones con barra como `'d have / would have`), persiste el intento y pasa `attemptId` al resultado.
   - `ResultsPage.tsx`: consulta las explicaciones gramaticales de Gemini Flash 3.5 directamente desde la API.
   - `Dashboard.tsx`: conecta el árbol de aprendizaje con las subcategorías reales y actualiza widgets con racha y meta diaria del usuario.
   - `Leaderboard.tsx`: desempaqueta la estructura paginada de rankings.

### Verificación y QA
- **Frontend Build**: `tsc -b && vite build` completado exitosamente con 0 errores.
- **Backend**: Contenedor `ceferly_backend` corriendo en puerto 4000 sin excepciones.
- **Smoke Tests**:
  - `GET /api/categories`: 200 OK con árbol de 6 categorías y 21 subcategorías.
  - `GET /api/exercises?subcategoryId=2`: 200 OK devolviendo ejercicios reales con campos normalizados.
  - `POST /api/ai/explain`: 200 OK con respuesta estructurada de Gemini Flash 3.5.

### Siguiente Prioridad (Ciclo 2)
- Mecánicas de gamificación en el frontend: sincronización en tiempo real del saldo de monedas/gemas al completar ejercicios en `ExercisePlayer`, descuento visual de vidas y recarga, y badges de racha en `Header.tsx`.
