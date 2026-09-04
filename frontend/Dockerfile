# Multi-stage Dockerfile for Ceferly Frontend (Optimized)
# Consistent with backend multi-stage structure and supports both development and production.

FROM node:22-alpine AS base
WORKDIR /app

# Stage 2: Install Development Dependencies
FROM base AS dev-deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Stage 3: Development Environment
# Targeted in docker-compose.yml for local development with hot reloading.
FROM dev-deps AS development
COPY . .
EXPOSE 4200
CMD ["npm", "run", "dev"]

# Stage 4: Production Build
FROM dev-deps AS builder
COPY . .
RUN npm run build

# Stage 5: Production Server (Lightweight Nginx)
# In production, we build the static assets and serve them.
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
