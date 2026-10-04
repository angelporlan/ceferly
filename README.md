# QuickGram (Ceferly) 🇬🇧🚀

**QuickGram** (también conocido internamente como **Ceferly**) es una plataforma web interactiva diseñada para la preparación de exámenes oficiales de inglés, enfocada inicialmente en el nivel **B2 (Cambridge First Certificate - FCE)** con vistas a expandirse a niveles superiores como **C1 (Advanced - CAE)**. 

El proyecto combina la resolución de ejercicios prácticos oficiales (Grammar, Reading, Use of English y Writing) con **Inteligencia Artificial (IA)**, la cual actúa como un tutor personalizado que corrige las tareas abiertas (Essays) y proporciona explicaciones gramaticales detalladas en tiempo real de cada uno de los errores cometidos.

---

## 🛠️ Arquitectura y Tecnologías

El proyecto se estructura como una aplicación monorrepositorio dividida en dos partes:

### 1. Backend (`/backend`)
*   **Servidor**: Node.js con Express (v5.2.1) en formato ESM (ES Modules).
*   **Base de Datos y ORM**: MySQL gestionado a través de **Sequelize** (v6.37.7) con el driver `mysql2`.
*   **Inteligencia Artificial**: Integración con **Google Gemini** (`gemini-3.5-flash` vía `@google/genai`), **OpenRouter API** (modelos como `deepseek-r1`) o **Groq SDK** para generar explicaciones gramaticales personalizadas y calificar redacciones.
*   **Pasarela de Pago**: **Stripe** (v20.1.0) para la gestión de suscripciones de usuarios (`pro` y `premium`).
*   **Autenticación**: JSON Web Tokens (**JWT**) y **Google Auth Library** para login con cuentas de Google.
*   **Correos Electrónicos**: Integración con **Resend** para el envío de correos de recuperación de contraseña.

### 2. Frontend (`/frontend`)
*   **Framework**: **React 19** con **TypeScript**, compilado y servido en desarrollo con **Vite** (puerto `4200`).
*   **Estilos**: **Tailwind CSS 3** y CSS, con la identidad visual verde de Ceferly (`#58CC02`).
*   **Rutas**: `react-router-dom` (React Router v7).
*   **Animaciones**: `lottie-web` para las animaciones disponibles.
*   **Pasarela de Pago**: `@stripe/stripe-js` para las pantallas de pago.

---

## 📁 Estructura de Base de Datos y Modelos

El modelo relacional de la base de datos MySQL está definido en `/backend/src/models/` y consta de las siguientes tablas:

```mermaid
erDiagram
    User ||--o{ UserExerciseAttempt : "realiza"
    User ||--o{ AiUsageDaily : "consume"
    Level ||--o{ Exercise : "tiene"
    Category ||--o{ Subcategory : "se divide en"
    Subcategory ||--o{ Exercise : "contiene"
    Exercise ||--o{ UserExerciseAttempt : "es intentado"
    UserExerciseAttempt ||--|| AttemptExplanation : "genera"
```

### Detalle de las Tablas:
1.  **`users` (`User.js`)**: Almacena los datos del usuario, incluyendo el nombre, email, contraseña hasheada con `bcrypt`, racha de días de estudio (`streak`), última fecha en que completó su meta (`last_completed_date`), monedas (`coins`), semilla del avatar (`avatar_seed`), ID de Google para inicio rápido y estado de su suscripción de Stripe (`subscription_role` y `subscription_expires_at`).
2.  **`levels` (`Level.js`)**: Niveles de inglés del Marco Común Europeo (ej. `B2`, `C1`).
3.  **`categories` (`Category.js`)**: Categorías generales del idioma (ej. `Grammar`, `Vocabulary`, `Reading`, `Listening`, `Use of English`, `Writing`).
4.  **`subcategories` (`Subcategory.js`)**: Tipos de ejercicios específicos dentro de cada categoría (ej. `Conditionals`, `Word Formation`, `Essay`, `Gapped Text`).
5.  **`exercises` (`Exercise.js`)**: Contiene las preguntas, opciones de selección (para respuestas múltiples), el texto base (si aplica) y la estructura de respuestas correctas en formato JSON (`correct_answer`).
6.  **`user_exercise_attempts` (`UserExerciseAttempt.js`)**: Historial de intentos de ejercicios por parte de los usuarios. Almacena las respuestas proporcionadas, los aciertos, el total de huecos y la puntuación final.
7.  **`attempt_explanations` (`AttemptExplanation.js`)**: Almacena en caché las explicaciones generadas por la IA para un intento de ejercicio fallido, evitando re-consultar a la API externa si el usuario vuelve a ver sus resultados.
8.  **`ai_usage_daily` (`AiUsageDaily.js`)**: Lleva la cuenta de cuántas consultas a la IA realiza cada usuario al día para aplicar los límites del plan.

---

## 🚀 Funcionalidades Clave

### 1. Corrección Inteligente y Tutoría por IA
Cuando un usuario comete fallos en un ejercicio, puede solicitar una **explicación por IA**. 
*   El backend detecta el tipo de ejercicio (condicionales, vocabulario, opción múltiple, etc.) y genera un prompt dinámico para el modelo LLM.
*   El LLM responde en un formato JSON estricto estructurado en: `general_feedback` (comentario motivacional) y `corrections` (explicando para cada hueco incorrecto por qué está mal la respuesta del alumno y cuál es la regla gramatical correcta).
*   **Caché**: Si el intento ya tiene una explicación en `attempt_explanations`, se sirve al instante desde la base de datos sin consumir tokens de IA.

### 2. Gamificación
*   **Meta Diaria e Hilo de Racha (Streak)**: Los usuarios definen una meta diaria de intentos (por defecto, 5). Al cumplirla, la racha aumenta en 1. Si pasan un día entero sin cumplir la meta, el contador vuelve a 0.
*   **Monedas (`coins`)**: Se otorgan monedas al finalizar cualquier ejercicio. La cantidad varía según el plan de suscripción (`free`: +10, `pro`: +15, `premium`: +20).
*   **Tienda de Avatares**: Los usuarios pueden gastar 50 monedas en comprar un avatar único y aleatorio (generado visualmente mediante una semilla en base a su username o un string aleatorio en el cliente).

### 3. Clasificación Global (Rankings)
Permite a los usuarios competir de forma sana en dos categorías:
*   **Más Activos (Most Active)**: Ordenado por el número de ejercicios únicos completados.
*   **Mejor Promedio (Highest Average)**: Ordenado por la calificación media obtenida en todos sus intentos.

### 4. Pasarela de Pagos Stripe
Soporta dos planes de suscripción de pago mensual:
*   **Plan Pro (9.99€/mes)**: Acceso ilimitado a ejercicios y estadísticas avanzadas, además de aumentar el límite de IA a 15 consultas diarias.
*   **Plan Premium (19.99€/mes)**: Incluye todo lo anterior, hasta 40 consultas diarias de IA, tutorías y certificados.
*   **Flujo**: El backend crea una sesión de Stripe Checkout y devuelve la URL. Al realizarse el pago, Stripe redirige a `/success?session_id=...` en el frontend, el cual llama a `/api/payments/verify-session` en el backend para validar el pago y extender la suscripción por 30 días de forma segura.

---

## 💻 Rutas actuales del Frontend

Las rutas están definidas en `frontend/src/App.tsx` con React Router:

### Acceso y ejercicios
*   `/login`, `/register` y `/forgot-password`: inicio de sesión, registro y recuperación de contraseña.
*   `/exercises/:id`: reproductor de ejercicios.

### Aplicación
*   `/` redirige a `/learn`.
*   `/learn`: panel de aprendizaje.
*   `/categories` y `/categories/:subcategoryId/exercises`: categorías y lista de ejercicios de una subcategoría.
*   `/results`: resultados del ejercicio.
*   `/shop`: tienda.
*   `/leaderboard`: clasificación.
*   `/profile`: perfil.
*   `/payment/success` y `/payment/cancel`: resultado del flujo de pago.

---

## 🚦 Endpoints de la API Backend

Todos los endpoints están protegidos por el middleware `authenticate` (JWT) a excepción de las rutas de login/registro y el webhook de Stripe.

### Autenticación (`/api`)
*   `POST /login` - Login clásico. Devuelve el JWT.
*   `POST /register` - Registro clásico con contraseña encriptada.
*   `POST /auth/google` - Login y registro rápido mediante Google Sign-In.
*   `POST /forgot-password` - Envía correo con token para restaurar contraseña.
*   `POST /reset-password` - Actualiza la contraseña usando el token del correo.

### Ejercicios (`/api`)
*   `GET /categories` - Listado de categorías.
*   `GET /subcategories` - Listado de subcategorías.
*   `GET /exercises` - Listado de ejercicios con filtros opcionales (por ejemplo, subcategoría y nivel).
*   `GET /exercises/:id` - Trae los datos de un ejercicio específico.

### Intentos (`/api`)
*   `POST /exercises/:id/attempt` - Envía y registra un intento de ejercicio por parte del usuario, calculando y sumando las monedas y actualizando su racha diaria.
*   `GET /attempts` - Listado paginado de todos los intentos del usuario autenticado.
*   `GET /attempts/:id` - Detalle de un intento junto con la explicación de la IA si ya existe en caché.
*   `GET /attempts/stats/global` - Estadísticas del usuario: número total de intentos y porcentaje medio de acierto.

### Explicaciones con IA (`/api`)
*   `POST /attempts/:id/explain` - Llama al modelo de lenguaje (DeepSeek/GPT) para generar la explicación del intento del ejercicio, validando previamente el límite diario y guardando el resultado en caché.

### Pagos con Stripe (`/api`)
*   `POST /create-checkout-session-pro` - Crea la sesión de pago para el plan Pro de Stripe.
*   `POST /create-checkout-session-premium` - Crea la sesión de pago para el plan Premium de Stripe.
*   `POST /payments/verify-session` - Verifica si una sesión de Stripe Checkout ha sido pagada correctamente y activa la suscripción del usuario en la base de datos.

### Gestión de Usuario (`/api`)
*   `GET /users/me` - Obtiene la información del perfil completo del usuario autenticado (y revisa el estado de su racha).
*   `PUT /users/me` - Modifica el nombre o el nombre de usuario (`username`).
*   `PUT /users/me/password` - Actualiza la contraseña validando la anterior.
*   `DELETE /users/me` - Elimina permanentemente la cuenta del usuario.
*   `GET /users/me/progress` - Desglose estadístico detallado de la actividad del usuario por niveles de inglés y categorías.
*   `GET /users/me/ai-usage` - Obtiene las peticiones de IA realizadas hoy, el límite del plan y las restantes.
*   `POST /users/me/role` - Cambia manualmente el rol de suscripción (útil para pruebas locales).
*   `GET /users/me/numberOfAttemptsToday` - Obtiene el recuento de ejercicios realizados hoy y el progreso de su meta diaria.
*   `PUT /users/me/daily-goal` - Cambia la meta diaria de ejercicios del usuario.
*   `POST /users/me/avatar` - Compra una nueva semilla de avatar aleatoria por 50 monedas.
*   `GET /users/rankings` - Clasificación global de usuarios con filtros de orden (`mostActive` o `highestAverage`) y paginación.

---

## 🚀 Puesta en Marcha Local

### Requisitos Previos
*   Node.js 22 (la versión usada por la imagen Docker del frontend).
*   Una base de datos MySQL activa.
*   Una cuenta en OpenRouter (o Groq) y Stripe (claves de prueba) si deseas probar las integraciones de IA y pagos.

### 1. Configurar el Backend
1.  Navega a la carpeta `/backend`:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz de la carpeta `/backend` tomando como referencia las siguientes variables:
    ```env
    ENV=TEST # TEST o PROD
    PORT_TEST=4000
    URL_TEST=http://localhost
    JWT_SECRET=tu_secreto_super_seguro_para_jwt
    
    # Base de Datos MySQL
    DB_NAME=nombre_de_tu_base_de_datos
    DB_USER=usuario_mysql
    DB_PASS=contrasena_mysql
    DB_HOST=127.0.0.1
    
    # Inteligencia Artificial
    AI_SERVER=Gemini # Gemini, OpenRouter o Groq
    GEMINI_API_KEY=tu_api_key_de_gemini
    GEMINI_MODEL=gemini-3.5-flash
    OPENROUTER_API_KEY=tu_api_key_de_openrouter
    GROQ_API_KEY=tu_api_key_de_groq
    
    # Stripe (Pasarela de pagos)
    STRIPE_SECRET_KEY_TEST=sk_test_tu_clave_secreta_de_stripe
    URL_FRONT_TEST=http://localhost:4200
    
    # Email (Resend)
    RESEND_API_KEY=re_tu_api_key_de_resend
    ```
4.  *(Opcional)* Si es la primera ejecución y quieres crear las tablas y rellenarlas con datos iniciales (Seeds), descomenta las líneas correspondientes en `/backend/src/server.js` (líneas 41 a 50) y arranca el servidor para poblar la base de datos de manera automática. Luego vuelve a comentarlas para evitar sobreescritura de datos reales.
5.  Inicia el servidor en modo desarrollo:
    ```bash
    npm run dev
    ```

### 2. Configurar el Frontend
1.  Navega a la carpeta `/frontend`:
    ```bash
    cd ../frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  (Opcional) Configura la URL base de la API en un archivo `frontend/.env`:
    ```env
    VITE_API_BASE_URL=http://localhost:4000/api
    ```
    Si no defines esta variable, el frontend usa `http://localhost:4000/api`.
4.  Inicia el servidor de desarrollo de Vite:
    ```bash
    npm run dev
    ```
5.  Abre el navegador y accede a `http://localhost:4200/`.
