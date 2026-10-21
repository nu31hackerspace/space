# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## What this is

The website and backend for **NU31 Hacker Space** (https://nu31.space), a Ukrainian nonprofit. It is a single **Nuxt 4** application that serves both the frontend (Vue 3) and the API (Nitro server). One repo, one deployable. Persistence is **PostgreSQL**, database `space` (no migrations — the database and tables are created on boot); it stores only anonymous analytics events (`tracking` table); request logs go to the console. There is no login: page content (merch, media coverage, gallery) is static, kept in `shared/` and `public/img/`. The project's stated philosophy is to keep the code simple enough that many people can contribute. The README is in Ukrainian.

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
npx vitest run         # single pass, use in CI (currently 5 files / 26 tests, green)
npx vitest run server/core/content/parse.test.ts   # one file
npx vitest run -t "parses h1 header"               # one test by name
```

Dev requires a PostgreSQL instance. The default URL is `postgresql://postgres:postgres@localhost:5432/space` (the database is created automatically). Quick start:

```bash
docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:17
```

## Critical conventions

- **Nuxt auto-import is OFF** (`imports.autoImport: false` in `nuxt.config.ts`). This is the most important thing to know here. Unlike a default Nuxt project, nothing is magically in scope — **import everything explicitly**:
    - Nuxt/Nitro/h3 helpers (`defineEventHandler`, `useRuntimeConfig`, `useNitroApp`, `getQuery`, `createError`, `defineNitroPlugin`, `defineNuxtRouteMiddleware`, `navigateTo`, `useFetch`, …) → from `#imports`
    - Vue APIs (`ref`, `computed`, …) → from `vue`
- **Path aliases:** `~~/` = project root (e.g. `~~/server/...`, `~~/shared/...`), `~/` = the `app/` directory. Vitest maps only `~~` (see `vitest.config.ts`), so unit-tested code should import shared logic via `~~/` or relative paths.
- **Configuration is `runtimeConfig` + env overrides.** Defaults live in `nuxt.config.ts`. In production they are overridden by `NUXT_*` env vars following Nuxt's convention (`postgresUrl` ← `NUXT_POSTGRES_URL`, `public.baseUrl` ← `NUXT_PUBLIC_BASE_URL`, etc. — see `docker-stack.yml` for the full mapping). Secrets (the Postgres URL) are never in the repo.
- **Formatting:** Prettier — no semicolons, single quotes, 4-space indent, `printWidth` 80. Prettier owns all formatting (including Vue templates, e.g. one attribute per line via `singleAttributePerLine`); ESLint (`eslint.config.js`, flat config) defers formatting to Prettier and focuses on code-quality rules. Run `npm run format` to fix style.

## Architecture

### Three layers

| Dir       | Role                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| `app/`    | Nuxt frontend — `pages/` (file-based routes), `components/`, `composables/`, `layouts/`, client `middleware/` |
| `server/` | Nitro backend — `api/` (HTTP handlers), `core/` (business logic), `middleware/`, `plugins/`, `routes/`        |
| `shared/` | Code/types used by both sides — `shared/types/` and pure utilities                                            |

### `server/core/` vs `server/api/` — the central pattern

`server/api/` handlers are thin: they parse the request, call into `server/core/`, talk to PostgreSQL, and shape the response. **All non-trivial logic** (validation, parsing, response shaping) lives in `server/core/` as pure, dependency-free functions. **Unit tests (`*.test.ts`) are colocated and target `server/core/` and `shared/`**, not the HTTP handlers — so when adding logic, put it in `core/` and test it there rather than inside a route.

### Request lifecycle (server middleware, runs in numeric order)

`1_log` (logs each request to the console) → `2_block_geo` (403s requests from RU/BY by country header) → `3_session_key` (sets an anonymous tracking cookie, read by `/api/track`).

### Startup (server plugins, run in numeric order)

`1_logger` (Winston on `nitroApp.logger`) → `2_postgres` (creates the database named in the URL and the tables if missing, sets `nitroApp.db` to a `pg` Pool). Request handlers use `requireDatabase(useNitroApp())`, which 503s until Postgres is ready (`server/core/runtime/database.ts`).

### Data access

PostgreSQL is reached through `useNitroApp().db` (or `requireDatabase(...)`), a `pg` Pool — use parameterized queries (`$1`, `$2`, …). In production it is the `postgres-1` service of the infra stack, reached over the `infra_postgres-net` network. The deploy workflow builds `POSTGRES_URL` from the infra stack's `USERNAME`/`PASSWORD`, so there is no separate secret for it.

## Deploy

Push to `main` triggers `.github/workflows/publish.yml`: build a Docker image (Node 24), push to `ghcr.io/nu31hackerspace/space`, then SSH-deploy to a **Docker Swarm** stack (`docker-stack.yml`) with `start-first` rolling updates. Health check: `GET /api/service/health`. All runtime config is injected as `NUXT_*` env vars from GitHub secrets/vars.
