ARG NODE_IMAGE=node:22-slim

FROM $NODE_IMAGE AS base

# Installe Chromium + dépendances pour Puppeteer
RUN apt-get update && apt-get install -y \
  dumb-init curl ca-certificates \
  fonts-liberation libappindicator3-1 libasound2 \
  libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
  libgdk-pixbuf2.0-0 libnspr4 libnss3 libnss3-tools \
  libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 \
  libxss1 libxtst6 xdg-utils libu2f-udev libvulkan1 chromium \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

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
COPY --chown=node:node --from=build /home/node/app/build ./
EXPOSE 3333
CMD [ "dumb-init", "node", "server.js" ]
