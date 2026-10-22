ARG NODE_VERSION=24.14.1

FROM node:${NODE_VERSION}-slim as base

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ARG PORT=3000

WORKDIR /src

FROM base as build

COPY --link package.json package-lock.json ./
RUN npm ci

COPY --link . .

RUN npm run build && npm prune --omit=dev

FROM base

ENV PORT=$PORT
ENV NODE_ENV=production

COPY --from=build /src/package.json ./package.json
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/dist ./dist

CMD ["node", "dist/index.js"]
