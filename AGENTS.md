# AGENTS.md

## Purpose

Guide for coding agents working in this repo. Use repo commands, follow existing
patterns, and keep edits focused. Prefer nearby conventions over new
abstractions.

## Stack Snapshot

- React Router (framework mode), React 18, TypeScript, Vite
- Package manager: `pnpm` (`pnpm-lock.yaml`)
- Runtime: Node `>=20` (Volta pins Node 20.10.0)
- Styling: Tailwind + custom CSS
- Content: MDX in `content/`
- Data/cache: Redis + `@epic-web/cachified`
- Integrations: Inngest, Algolia, Sentry, Fly.io

## Important Paths

- App: `app/`
- Routes: `app/routes/`
- Utilities: `app/utils/`
- Inngest: `app/inngest/`
- Content: `content/blog`, `content/til`, `content/pages`
- Server entry: `index.mjs`, `server/index.mjs`, `server/dev-server.mjs`
- Config: `tsconfig.json`, `eslint.config.mjs`, `prettier.config.js`

## Setup

- Install deps: `pnpm install`
- Pull env (optional): `npx dotenv-vault pull`
- Start Redis: `docker-compose up -d`
- Optional Inngest server: `npx inngest-cli@latest dev`
- Start app: `pnpm dev` (usually `http://localhost:8080`)

## Build/Lint/Typecheck/Test

### Core commands

- Clean: `pnpm clean`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Start prod: `pnpm start`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Format: `pnpm format`
- Extra checks: `pnpm knip`

### Test status

- `pnpm test` is a placeholder: `echo I should write some tests`
- No committed runner config (`vitest`, `jest`, `playwright.config.*`)
- No committed test files found
- There is no real automated suite yet

### Running a single test

- Current state: not available (placeholder script)
- If adding a runner, add single-test commands to `package.json`
- Playwright example file: `pnpm exec playwright test tests/a.spec.ts`
- Playwright example test: `pnpm exec playwright test tests/a.spec.ts -g "name"`
- Playwright line target: `pnpm exec playwright test tests/a.spec.ts:42`

### Targeted command pattern

- Lint one file: `pnpm lint -- app/routes/_index.tsx`
- Typecheck is project-wide (`tsc -b .`), so use `pnpm typecheck`

## Pre-commit and CI

- Pre-commit hook (`.husky/pre-commit`) runs `npx lint-staged`
- `lint-staged` runs clean, test, lint, typecheck, and prettier
- CI deploy workflow runs lint + typecheck before deploy

## Code Style Guidelines

### Formatting and linting

- Prettier is source of truth (`prettier.config.js`)
- ESLint config is `eslint.config.mjs`
- Prettier/ESLint both extend `@epic-web/config/*`
- Prefer fixing warnings instead of disabling rules
- Existing style: single quotes, trailing commas, minimal semicolons

### Imports

- Order: Node built-ins -> third-party -> `~/...` -> relative
- Prefer `type` imports for type-only symbols
- Use `~/` alias for cross-app imports (`~/*` -> `app/*`)
- Use relative imports for same-folder files

### TypeScript and validation

- `strict: true` is enabled; keep code strongly typed
- Avoid `any`; use `unknown` and narrow
- Use Zod for runtime validation of untrusted input
- Infer schema types with `z.infer<typeof schema>`
- In routes, prefer `useLoaderData<typeof loader>()`
- Use `LoaderFunctionArgs` / `ActionFunctionArgs` from `react-router`

### Naming conventions

- Files/folders: kebab-case
- Components and types: PascalCase
- Variables/functions: camelCase
- Booleans should read as predicates (`isOpen`, `hasX`, `showX`)
- Server-only modules use `.server.ts`
- Client-only modules use `.client.tsx` when applicable

### Route/data patterns

- Common route exports: `loader`, `action`, `meta`, `shouldRevalidate`, default
- Use `data(...)`, `redirect(...)`, and thrown `Response`
- Use `invariantResponse` for required params/data checks
- Keep explicit status codes for expected failures

### Error handling

- Validate params, form data, JSON body, and env early
- Log useful context in catch blocks
- Rethrow when callers should fail
- Return fallbacks only when intentionally graceful

### Environment variables

- Env schema is in `app/utils/env.server.ts`
- Add new env vars there before use
- Expose only safe values via `getEnv()`
- Never leak secrets to `window.ENV`

### Caching and async work

- Follow Redis key patterns (`gql:*`, `home:*`)
- Reuse existing cachified patterns in `app/utils/*`
- For bulk refreshes, use bounded concurrency (`p-queue`)
- Be careful changing cache key shapes

### UI and MDX

- Tailwind is the default styling approach
- Use `twMerge` / `twJoin` for conditional classes
- Reuse shared UI primitives before adding new ones
- MDX compile path: `app/utils/mdx.server.ts`
- MDX cache/list path: `app/utils/mdx-utils.server.ts`

## Cursor/Copilot Rules

- Checked `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`
- No Cursor or Copilot instruction files were found

## Agent Working Agreement

- Make minimal, targeted changes
- Avoid bundling broad refactors with feature/fix work
- Keep server/client boundaries intact (`.server` must not leak client-side)
- After non-trivial edits, run `pnpm lint` and `pnpm typecheck`
- If you add tests, add full-suite + single-test commands and update this file
