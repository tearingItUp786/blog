# Taran's Personal Blog

## Overview

It's my blog yo!

## Stack

- Frontend: React 19 + React Router v8 + TypeScript + Vite+
- Styling: Tailwind CSS + custom styles
- Content: MDX in `content/blog`, `content/til`, and `content/pages`
- Caching: Redis + `@epic-web/cachified`
- Background jobs: Inngest
- Search and observability: Algolia + Sentry
- Deployment: Fly.io

## Prerequisites

- Node.js 24.x (Volta pins `24.13.1`)
- pnpm (Volta pins `12.4.1`)
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

## Secrets and Environment

The project uses dotenvx for local environment loading and encrypted production
configuration. It does not depend on a hosted secret-management service.

| File or variable                | Purpose                                            | Storage    |
| ------------------------------- | -------------------------------------------------- | ---------- |
| `.env.example`                  | Supported variable names and safe defaults         | Git        |
| `.env`                          | Plaintext local development values                 | Gitignored |
| `.env.production`               | Encrypted production values                        | Git        |
| `.env.keys`                     | Private key used to decrypt `.env.production`      | Gitignored |
| `DOTENV_PRIVATE_KEY_PRODUCTION` | Production private key provided to the application | Fly secret |

### Runtime Selection

`load-env.mjs` selects the environment file using `NODE_ENV`:

- Development loads `.env`.
- Production loads `.env.production` in strict mode.
- The Docker image includes `.env.production` but excludes `.env` and
  `.env.keys`.
- Fly provides `DOTENV_PRIVATE_KEY_PRODUCTION` when the container starts.

Local development cannot accidentally inherit production values merely because
`.env.keys` exists on the machine.

### Local Setup

Create the local development file:

```bash
cp .env.example .env
```

Add local-only values to `.env`. Never use local `.env` values to populate the
production file.

If production access is required on a new machine, restore `.env.keys` from
1Password into the repository root. Never commit that file.

### Backups

Keep the following in 1Password:

- The plaintext production environment as a secure document.
- `.env.keys` as a secure document or attachment.

Git contains the encrypted `.env.production`, but its values cannot be recovered
without either `.env.keys` or the plaintext backup.

### Verify Production Decryption

Verify that `.env.production` and `.env.keys` match without printing secret
values:

```bash
NODE_ENV=production pnpm exec dotenvx run \
  -f .env.production \
  -fk .env.keys \
  -- node -e "console.log('production env decrypts')"
```

### Update a Production Value

Update one encrypted value without decrypting the entire file:

```bash
pnpm exec dotenvx set NAME VALUE \
  -f .env.production \
  -fk .env.keys
```

Values passed directly may remain in shell history. Prefer retrieving the value
through the 1Password CLI or using a temporary shell session with history
disabled.

After changing production values:

1. Verify production decryption.
2. Commit `.env.production`.
3. Push to `main` and let the normal Fly deployment run.

Routine value changes reuse the existing private key, so they do not require a
Fly secret update.

### Rotate the Production Key

Rotate the key only if `.env.keys` is exposed or intentionally replaced. First
use the plaintext 1Password backup to produce a matching new `.env.production`
and `.env.keys` outside the repository. Replace the local files, then stage the
new key so Fly applies it with the image containing the newly encrypted
`.env.production`:

```bash
fly secrets import --stage --app staging-taran-v2 < .env.keys
pnpm deploy
```

Verify Fly health checks and `/health` after the deployment. Do not import a
rotated key without `--stage`; restarting the current image with a mismatched
key will prevent production startup.

## Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - build the app with React Router
- `pnpm start` - run production server entry
- `pnpm clean` - remove build/cache artifacts
- `pnpm check` - check formatting, lint, and types across the project
- `pnpm lint` - run Oxlint plus the narrow ESLint compatibility checks
- `pnpm typecheck` - run TypeScript project build checks
- `pnpm format` - format with Oxfmt (including Tailwind class sorting)
- `pnpm knip` - check for unused files/deps/exports
- `pnpm test` - run the full suite via Vite+'s bundled Vitest
- `pnpm test:watch` - run Vitest in watch mode
- `pnpm test:single` - run a single test file or filtered tests
- `pnpm diagrams:check` - verify Mermaid fences have current sibling SVGs

## Quality Gates

- Husky checks Mermaid assets first, generating missing/stale SVGs through
  OpenCode and stopping for artwork review before any formatting.
- `vp staged` then formats supported staged files and lints staged scripts.
  Partial staging is preserved. Commits do not clean caches, run the full test
  suite, or typecheck the whole project.
- Run `pnpm check` and `pnpm test` before opening a pull request. Every pull
  request runs these full checks and `pnpm diagrams:check`, including
  content-only changes.
- CI validates diagram assets before both deploy and content-only refresh paths.

Vite+ is installed locally; no global `vp` install or runtime-manager change is
required. Keep using `pnpm dev` for the mock-enabled server and `pnpm build` for
React Router builds. Use `pnpm exec vp` for direct tooling commands.

Formatting and native lint rules live in `vite.config.ts`. Full checks retain
`tsc -b` as the authoritative TypeScript gate and a small `eslint.config.mjs`
compatibility layer for import ordering, Epic Web disposal rules, and Playwright
rules. These do not run on every commit. `other/staged-lint.config.ts` shares
the native rules but disables project-wide type analysis on the staged path.

## Deployment

- Deploy target is Fly.io (`fly.toml`).
- Main deploy workflow lives in `.github/workflows/deploy.yml`.
- Content refresh workflow lives in `.github/workflows/refresh-cache.yml`.
- Deployments build the committed encrypted `.env.production` into the image.
- Fly injects `DOTENV_PRIVATE_KEY_PRODUCTION` at runtime.
- GitHub Actions and Docker builds do not need `.env.keys`.
- Normal production-value changes require a commit and deployment, but no Fly
  secret update.
