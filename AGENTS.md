# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## What this is

The website and backend for **NU31 Hacker Space** (https://nu31.space), a Ukrainian nonprofit. The repository contains two separated applications:

- **Frontend (`app/`, root)**: a **Nuxt 4** application (Vue 3 + Tailwind 4). Page content (merch, media coverage, gallery) is static, kept in `shared/` and `public/img/`.
- **Backend (`backend/`)**: a standalone **Node.js (`node:http`) + TypeScript** server with **PostgreSQL** (`space` database, `tracking` table created on boot). It exposes `/api/service/health` and `/api/track` for anonymous analytics events.

The project's stated philosophy is to keep the code simple enough that many people can contribute. The README is in Ukrainian.

## Commands

```bash
# Frontend (root)
npm install            # installs deps; preinstall runs `nuxt prepare`, which generates
                       # .nuxt/tsconfig.*.json referenced by the root tsconfig — required
                       # for types to resolve on a fresh clone

npm run dev            # Nuxt dev server at http://localhost:3000 (proxies /api/* to :3001)
npm run build          # production Nuxt build into .output/
npm run preview        # serve the production Nuxt build locally
npm run generate       # static site generation

npm run format         # prettier --write .   (format:check to verify only)
npm run lint           # eslint .             (lint:fix to autofix)

# Backend (backend/)
cd backend && npm install
npm run backend:dev    # Backend dev server at http://localhost:3001 (node --watch)
npm run backend:build  # Compile TypeScript into backend/dist/
npm run backend:test   # Run backend unit tests with Vitest
```

Backend dev requires a PostgreSQL instance. The default URL is `postgresql://postgres:postgres@localhost:5432/space`. Quick start:

```bash
docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=space -d postgres:17
```

## Critical conventions

- **Nuxt auto-import is OFF** (`imports.autoImport: false` in `nuxt.config.ts`). Unlike a default Nuxt project, nothing is magically in scope — **import everything explicitly**:
    - Nuxt helpers (`defineNuxtRouteMiddleware`, `navigateTo`, `useFetch`, `useRuntimeConfig`, …) → from `#imports`
    - Vue APIs (`ref`, `computed`, …) → from `vue`
- **Path aliases (frontend):** `~~/` = project root (e.g. `~~/shared/...`), `~/` = the `app/` directory.
- **Formatting:** Prettier — no semicolons, single quotes, 4-space indent, `printWidth` 80. Prettier owns all formatting (including Vue templates, e.g. one attribute per line via `singleAttributePerLine`); ESLint (`eslint.config.js`, flat config) defers formatting to Prettier and focuses on code-quality rules. Run `npm run format` to fix style.

## Architecture

| Dir        | Role                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `app/`     | Nuxt frontend — `pages/` (file-based routes), `components/`, `composables/`, `layouts/`, `utils/`             |
| `shared/`  | Static data and types used by the frontend (`merch.ts`, `media.ts`, `types/`)                                 |
| `backend/` | Standalone Node.js (`node:http`) + TypeScript API server (`/api/service/health`, `/api/track`) and unit tests |

### Routing between frontend and backend

In production, the reverse proxy routes `/api/*` on `nu31.space` to the `backend` service and all other traffic to the `app` service. In local development, Vite's dev server proxy (`vite.server.proxy` in `nuxt.config.ts`) forwards `/api/*` requests from `http://localhost:3000` to `http://localhost:3001` (configurable via `BACKEND_URL`).

### Data access (`backend/`)

PostgreSQL is reached through a `pg` `Pool` initialized on startup in `backend/src/database.ts` — use parameterized queries (`$1`, `$2`, …). In production it connects to the `postgres-1` service of the infra stack over the `infra_postgres-net` network.

## Deploy

Push to `main` triggers `.github/workflows/publish.yml`: builds and pushes two Docker images (`ghcr.io/nu31hackerspace/space` from `./Dockerfile` and `ghcr.io/nu31hackerspace/space-backend` from `./backend/Dockerfile`), then SSH-deploys both services (`app` and `backend`) to the **Docker Swarm** stack (`docker-stack.yml`) with `start-first` rolling updates.
