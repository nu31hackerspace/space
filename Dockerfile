ARG NODE_VERSION=24.15.0

FROM node:${NODE_VERSION}-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ARG PORT=3000

WORKDIR /src

FROM base AS build

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY --link package.json package-lock.json ./
RUN npm ci

COPY --link . .

RUN npm run build

FROM base

ENV PORT=$PORT
ENV NODE_ENV=production

COPY --from=build /src/.output /src/.output

CMD ["node", ".output/server/index.mjs"]
