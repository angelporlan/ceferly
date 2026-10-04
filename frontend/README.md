# Frontend de Ceferly

Aplicación web construida con React 19, TypeScript y Vite. Tailwind CSS 3 y CSS se usan para los estilos; React Router gestiona la navegación.

## Requisitos

- Node.js 22
- npm

## Desarrollo local

Desde esta carpeta:

```bash
npm install
npm run dev
```

Vite sirve la aplicación en `http://localhost:4200/`. Para compilarla para producción:

```bash
npm run build
```

Los comandos disponibles están definidos en `package.json`: `dev`, `build`, `lint` y `preview`.

## Configuración de la API

El frontend usa `http://localhost:4000/api` por defecto. Para cambiar esa dirección, define `VITE_API_BASE_URL` en el archivo `.env` de esta carpeta, por ejemplo:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

En Docker Compose, la URL ya está configurada para el frontend.

## Rutas

Las rutas se mantienen en `src/App.tsx`. Incluyen acceso (`/login`, `/register`, `/forgot-password`), ejercicios (`/exercises/:id`) y las vistas principales (`/learn`, `/categories`, `/results`, `/shop`, `/leaderboard`, `/profile` y las rutas de pago).
