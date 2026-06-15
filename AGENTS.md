# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## What this is

The website and backend for **NU31 Hacker Space** (https://nu31.space), a Ukrainian nonprofit. It is a single **Nuxt 4** application that serves both the frontend (Vue 3) and the API (Nitro server). One repo, one deployable. Persistence is **MongoDB** (no migrations — collections and indexes are created on boot). The project's stated philosophy is to keep the code simple enough that many people can contribute. The README is in Ukrainian.

Notable integrations: **Discord** (OAuth login, member sync, a bot, a karma system), **MQTT** (broker management + an electricity/blackout tracker), and **GridFS** image storage.

## Commands

```bash
npm install            # installs deps; preinstall runs `nuxt prepare`, which generates
                       # .nuxt/tsconfig.*.json referenced by the root tsconfig — required
                       # for types to resolve on a fresh clone

npm run dev            # dev server at http://localhost:3000 (falls back to 3001, 3002…)
npm run build          # production build into .output/
npm run preview        # serve the production build locally
npm run generate       # static site generation

npm run format         # prettier --write .   (format:check to verify only)
npm run lint           # eslint .             (lint:fix to autofix)

# ESLint 9 flat config lives in `eslint.config.js` (createConfigForNuxt from
# @nuxt/eslint-config + @vue/eslint-config-prettier). Formatting is owned by Prettier:
# ESLint reports real code issues as errors and Prettier drift as warnings. The repo
# was never linted before this config existed, so expect a backlog of pre-existing
# lint errors (mostly `@typescript-eslint/no-explicit-any` and unused vars).

npm test               # vitest in WATCH mode
npx vitest run         # single pass, use in CI (currently 18 files / 110 tests, green)
npx vitest run server/core/content/parse.test.ts   # one file
npx vitest run -t "parses h1 header"               # one test by name
```

Dev requires a MongoDB instance. The default URI is `mongodb://localhost:27017/nu31space`. Quick start:

```bash
docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest
```

## Critical conventions

- **Nuxt auto-import is OFF** (`imports.autoImport: false` in `nuxt.config.ts`). This is the most important thing to know here. Unlike a default Nuxt project, nothing is magically in scope — **import everything explicitly**:
  - Nuxt/Nitro/h3 helpers (`defineEventHandler`, `useRuntimeConfig`, `useNitroApp`, `getQuery`, `createError`, `defineNitroPlugin`, `defineNuxtRouteMiddleware`, `navigateTo`, `useFetch`, …) → from `#imports`
  - Vue APIs (`ref`, `computed`, …) → from `vue`
- **Path aliases:** `~~/` = project root (e.g. `~~/server/...`, `~~/shared/...`), `~/` = the `app/` directory. Vitest maps only `~~` (see `vitest.config.ts`), so unit-tested code should import shared logic via `~~/` or relative paths.
- **Configuration is `runtimeConfig` + env overrides.** Defaults live in `nuxt.config.ts`. In production they are overridden by `NUXT_*` env vars following Nuxt's convention (`mongoUri` ← `NUXT_MONGO_URI`, `public.baseUrl` ← `NUXT_PUBLIC_BASE_URL`, etc. — see `docker-stack.yml` for the full mapping). Secrets (Mongo URI, Discord, JWT, MQTT) are never in the repo.
- **Formatting:** Prettier — no semicolons, single quotes, 4-space indent, `printWidth` 80. Prettier owns all formatting (including Vue templates, e.g. one attribute per line via `singleAttributePerLine`); ESLint (`eslint.config.js`, flat config) defers formatting to Prettier and focuses on code-quality rules. Run `npm run format` to fix style.

## Architecture

### Three layers

| Dir       | Role |
|-----------|------|
| `app/`    | Nuxt frontend — `pages/` (file-based routes), `components/`, `composables/`, `layouts/`, client `middleware/` |
| `server/` | Nitro backend — `api/` (HTTP handlers), `core/` (business logic), `middleware/`, `plugins/`, `routes/` |
| `shared/` | Code/types used by both sides — `shared/types/` and pure utilities |

### `server/core/` vs `server/api/` — the central pattern

`server/api/` handlers are thin: they parse the request, enforce auth, call into `server/core/`, talk to MongoDB, and shape the response. **All non-trivial logic** (query/filter building, validation, markdown parsing, response shaping, ownership checks, RSS, pagination) lives in `server/core/` as pure, dependency-free functions. **Unit tests (`*.test.ts`) are colocated and target `server/core/` and `shared/`**, not the HTTP handlers — so when adding logic, put it in `core/` and test it there rather than inside a route.

### Request lifecycle (server middleware, runs in numeric order)

`1_log` → `2_block_geo` (403s requests from RU/BY by country header) → `3_session_key` (sets an anonymous tracking cookie) → `4_auth` (verifies the `jwt` cookie, confirms the session is still active in `users`, and attaches `event.context.user`). **Route handlers check `event.context.user`** and throw 401 themselves — there is no per-route auth wrapper. Ownership-gated writes compare `event.context.user.userId` against the document's `owner_id`.

### Startup (server plugins, run in numeric order)

`1_logger` (Winston on `nitroApp.logger`) → `2_mongo` (connects, sets `nitroApp.db`, creates all indexes idempotently) → `3_file_store` (GridFS, waits for the DB) → `4_discord_memebers` → `5_discord_bot`; `mqtt` connects to the broker. Plugins that need the DB call `waitForDatabase()`; request handlers use `requireDatabase(useNitroApp())`, which 503s until Mongo is ready (`server/core/runtime/database.ts`).

### Data access

MongoDB is reached through `useNitroApp().db` (or `requireDatabase(...)`). Images are stored in **GridFS** via `nitroApp.fileStores`, with one bucket per `FileStoreType` (user avatars, media images, gallery images — see `server/plugins/3_file_store.ts`). Avatars/images are served back through dedicated API routes that stream from GridFS.

### Content / blog system

One MongoDB collection, `blogPosts`, backs two API surfaces:
- `/api/content/*` — **public read** (published posts only; list, single, tags, view counting via `blogPostViews`).
- `/api/blog/*` — **authenticated admin CRUD** (create/update/delete, drafts, version history in a `versions` array).

The app mirrors this: `app/pages/blog/` is the public reader, `app/pages/admin/blog/` is the editor. Posts are authored as Markdown; `server/core/content/parse.ts` parses raw Markdown once into a typed `ContentBlock[]` (`shared/types/content.ts`), and `app/components/BlogContentBlocks.vue` dispatches each block to a matching component in `app/components/blog/`. Slugs are generated from titles with **Ukrainian→Latin transliteration** (`shared/utils.ts`); uniqueness is enforced by a unique index (duplicate → 409).

### Auth

Discord OAuth: the callback exchanges the code for a token (`server/core/discord/auth.ts`), a user record + session is created, and a signed **JWT is set as the `jwt` cookie**. The `4_auth` middleware validates it on every request. On the client, `app/composables/useUser.ts` fetches `/api/user/me`, and `app/middleware/auth.ts` redirects anonymous users away from protected pages. A `dev-login` endpoint exists for local development.

### MQTT & electricity tracker

`server/plugins/mqtt.ts` opens one broker connection, subscribes to `#` to track active topics in-memory (`server/utils/mqttStore.ts`), and implements a queued **Dynamic Security** (`$CONTROL/dynamic-security`) request/response flow used by the admin UI to manage MQTT users and ACLs. The electricity tracker (`server/api/electricty_tracker/*`, `electricity_trackers` + `electricity_tracker_alive` collections) records device heartbeats to report power/blackout status.

## Deploy

Push to `main` triggers `.github/workflows/publish.yml`: build a Docker image (Node 24), push to `ghcr.io/nu31hackerspace/space`, then SSH-deploy to a **Docker Swarm** stack (`docker-stack.yml`) with `start-first` rolling updates. Health check: `GET /api/service/health`. All runtime config is injected as `NUXT_*` env vars from GitHub secrets/vars.
