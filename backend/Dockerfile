FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dev-deps
COPY package*.json ./
RUN npm ci

FROM dev-deps AS development
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS production
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src
COPY public/ ./public
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
