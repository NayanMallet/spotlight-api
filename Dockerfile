ARG NODE_IMAGE=node:22-slim

FROM $NODE_IMAGE AS base

RUN apt-get update && apt-get install -y \
  dumb-init curl ca-certificates \
  fonts-liberation firefox-esr && \
  rm -rf /var/lib/apt/lists/*

# Désactive D-Bus pour éviter les erreurs de bus de session dans Chromium
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null

# Installe pnpm
RUN npm install -g pnpm
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .

FROM dependencies AS build
RUN pnpm run build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --production
COPY --chown=node:node --from=build /home/node/app/build ./build
EXPOSE 3333
CMD [ "dumb-init", "node", "build/bin/server.js" ]
