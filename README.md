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

- Node.js 24.x (Volta pins `24.13.1`)
- pnpm (Volta pins `10.6.3`)
- Docker + Docker Compose (for Redis)
- Chromium (used by Playwright/mermaid tooling)

Optional:

- Volta for toolchain pinning
- Inngest CLI for local function inspection

## Local Development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and add your local values.

   Production values are encrypted in `.env.production`. The private key stays
   in the ignored `.env.keys` file and is configured on Fly as the single
   `DOTENV_PRIVATE_KEY_PRODUCTION` secret.

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

## Environment Files

- `.env` contains plaintext local development values and is ignored by Git.
- `.env.production` contains encrypted production values and is committed.
- `.env.keys` contains the production decryption key and is ignored by Git.
- Fly stores only `DOTENV_PRIVATE_KEY_PRODUCTION`; dotenvx decrypts
  `.env.production` when the app starts.

Back up both the plaintext production values and `.env.keys` in 1Password. Never
commit `.env` or `.env.keys`, and never use local `.env` values to update the
production file. For a single production change, update the encrypted file
without decrypting it in the repository:

```bash
pnpm exec dotenvx set NAME value -f .env.production
```

## Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - build the app with React Router
- `pnpm start` - run production server entry
- `pnpm clean` - remove build/cache artifacts
- `pnpm lint` - run ESLint
- `pnpm typecheck` - run TypeScript project build checks
- `pnpm format` - run Prettier
- `pnpm knip` - check for unused files/deps/exports
- `pnpm test` - run smoke tests via Vitest
- `pnpm test:watch` - run Vitest in watch mode
- `pnpm test:single` - run a single test file or filtered tests
- `pnpm diagrams:check` - verify Mermaid fences have current sibling SVGs

## Quality Gates

- Pre-commit generates missing/stale Mermaid SVGs through OpenCode and stops for
  review before running `lint-staged`.
- `lint-staged` runs clean, test, lint, typecheck, and prettier on staged files.
- CI validates diagram assets before both deploy and content-only refresh paths.

## Deployment

- Deploy target is Fly.io (`fly.toml`).
- Main deploy workflow lives in `.github/workflows/deploy.yml`.
- Content refresh workflow lives in `.github/workflows/refresh-cache.yml`.
