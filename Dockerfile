FROM node:18.16.0-slim AS build-stage
ENV NODE_ENV production
WORKDIR /usr/src/app

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node .env* ./

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm fetch --prod

RUN pnpm install -r --offline --prod

COPY --chown=node:node . .

RUN pnpm tsc

FROM node:18.16.0-slim
ENV NODE_ENV production
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=build-stage /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build-stage /usr/src/app/build /usr/src/app/build

COPY --chown=node:node rideshare-creds.json ./build

USER node

CMD ["dumb-init", "node", "build/src/index.js" | "pnpm", "pino-pretty"] 