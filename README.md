# Taran's Personal Blog

## Overview

It's my blog yo!

## Stack

- Frontend: React 18 + React Router v7 + TypeScript + Vite
- Styling: Tailwind CSS + custom styles
- Content: MDX in `content/blog`, `content/til`, and `content/pages`
- Caching: Redis + `@epic-web/cachified`
- Background jobs: Inngest
- Search and observability: Algolia + Sentry
- Deployment: Fly.io

## Prerequisites

- Node.js 20.x (Volta pins `20.10.0`)
- pnpm (Volta pins `10.6.3`)
- Docker + Docker Compose (for Redis)
- Chromium (used by Playwright/mermaid tooling)

Optional:

- Volta for toolchain pinning
- Dotenv Vault for pulling environment values
- Inngest CLI for local function inspection

## Local Development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create local env values:

   - copy `.env.example` to `.env`, or
   - pull with dotenv vault:

   ```bash
   npx dotenv-vault pull
   ```

3. Start Redis:

   ```bash
   docker-compose up -d
   ```

4. Optionally run Inngest locally:

   ```bash
   npx inngest-cli@latest dev
   ```

5. Start the app:

   ```bash
   pnpm dev
   ```

App runs at `http://localhost:8080` by default.

## Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - build the app with React Router
- `pnpm start` - run production server entry
- `pnpm clean` - remove build/cache artifacts
- `pnpm lint` - run ESLint
- `pnpm typecheck` - run TypeScript project build checks
- `pnpm format` - run Prettier
- `pnpm knip` - check for unused files/deps/exports
- `pnpm test` - placeholder script (no committed test runner yet)

## Quality Gates

- Pre-commit hook runs `lint-staged`.
- `lint-staged` runs clean, test, lint, typecheck, and prettier on staged files.
- CI deploy workflow runs lint and typecheck before deploy.

## Deployment

- Deploy target is Fly.io (`fly.toml`).
- Main deploy workflow lives in `.github/workflows/deploy.yml`.
- Content refresh workflow lives in `.github/workflows/refresh-cache.yml`.
