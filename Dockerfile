# ➤ Build stage
FROM node:22-alpine AS build
WORKDIR /app

# ✅ Activer corepack pour pnpm
RUN corepack enable

# Copier fichiers essentiels pour les dépendances
COPY pnpm-lock.yaml package*.json tsconfig*.json ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le code source et builder
COPY . .
RUN node ace build

# ➤ Production stage
FROM node:22-alpine AS production
WORKDIR /app

# Activer corepack + installer dumb-init
RUN corepack enable && apk add --no-cache dumb-init

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333

# Copier uniquement build et fichiers pour prod
COPY --from=build /app/build ./build
COPY --from=build /app/bin ./bin
COPY pnpm-lock.yaml package*.json ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Créer un utilisateur non-root
RUN addgroup -S nodejs && adduser -S adonisjs -G nodejs \
 && chown -R adonisjs:nodejs /app

USER adonisjs

EXPOSE 3333
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "bin/server.js"]
