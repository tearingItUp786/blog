<!-- BEGIN swamp managed section - DO NOT EDIT -->

# Project

This repository is managed with [swamp](https://github.com/swamp-club/swamp).

## Rules

1. **Search before you build.** When automating AWS, APIs, or any external
   service: (a) search community extensions with
   `swamp extension search <query>` — prefer `@swamp/*` official extensions
   first, (b) search local/installed types with
   `swamp model type search <query>`, (c) if a community extension exists,
   install it with `swamp extension pull <package>` instead of building from
   scratch, (d) extend an existing type if it covers the domain but lacks the
   method you need, (e) only create a custom extension model in
   `extensions/models/` as a last resort. Use the `swamp` skill for guidance.
   The `command/shell` model is ONLY for ad-hoc one-off shell commands, NEVER
   for wrapping CLI tools or building integrations.
2. **Extend, don't be clever.** When a model covers the domain but lacks the
   method you need, extend it with `export const extension` — don't bypass it
   with shell scripts, CLI tools, or multi-step hacks. One method, one purpose.
   Use `swamp model type describe <type> --json` to check available methods.
3. **Use the data model.** Once data exists in a model (via `lookup`, `start`,
   `sync`, etc.), reference it with CEL expressions. Don't re-fetch data that's
   already available.
4. **CEL expressions everywhere.** Wire models together with CEL expressions.
   Always prefer `data.latest("<name>", "<dataName>").attributes.<field>` over
   the deprecated `model.<name>.resource.<spec>.<instance>.attributes.<field>`
   pattern.
5. **Verify before destructive operations.** Always
   `swamp model get <name> --json` and verify resource IDs before running
   delete/stop/destroy methods.
6. **Prefer fan-out methods over loops.** When operating on multiple targets,
   use a single method that handles all targets internally (factory pattern)
   rather than looping N separate `swamp model method run` calls against the
   same model. Multiple parallel calls against the same model contend on the
   per-model lock, causing timeouts. A single fan-out method acquires the lock
   once and produces all outputs in one execution. Check
   `swamp model type describe` for methods that accept filters or produce
   multiple outputs.
7. **Extension npm deps are bundled, not lockfile-tracked.** Swamp's bundler
   inlines all npm packages (except zod) into extension bundles at bundle time.
   `deno.lock` and `package.json` do NOT cover extension model dependencies —
   this is by design. Always pin explicit versions in `npm:` import specifiers
   (e.g., `npm:lodash-es@4.17.21`).
8. **Reports for reusable data pipelines.** When the task involves building a
   repeatable pipeline to transform, aggregate, or analyze model output
   (security reports, cost analysis, compliance checks, summaries), create a
   report extension. Use the `swamp` skill for guidance.
9. **"Workflow" means a swamp workflow.** In this repository the word "workflow"
   (and "create/run/execute/validate/debug workflow", "automate", "orchestrate",
   "automated/nightly job") refers to a swamp workflow — a declarative YAML DAG
   of model-method steps authored via `swamp workflow create`. Load and follow
   the `swamp` skill for these requests. Do NOT interpret these as a request to
   build an agent task list, spin up worktrees, or schedule a cron/remote agent.
   Only use those orchestration mechanisms when the user explicitly names one
   (e.g. "task list", "subagent", "worktree", "cron", "remote agent") or
   explicitly asks you to do the work yourself step by step rather than author a
   swamp workflow.
10. **Use swamp, don't bypass it.** Always work through swamp commands — don't
    go around them with raw shell tools. Use `swamp data query` to find data,
    not `grep`/`find` on `.swamp/` files. Use model methods to interact with
    resources, not `curl`/`aws`/`gcloud`/`kubectl` when a model type already
    wraps that API — check with `swamp model type search`. Use `swamp help` for
    CLI discovery, not guesswork. Composing with swamp output is fine (e.g.
    piping `--json` through `jq`) — the anti-pattern is bypassing swamp
    entirely.
11. **Inspect reports after failures.** When a model method or workflow run
    fails, inspect its generated reports before retrying or changing
    definitions. Reports run even on failure and capture structured diagnostics
    — error messages, execution status, arguments, and data output pointers. Use
    `swamp report get @swamp/method-summary --model <model> --json` for method
    failures or
    `swamp report get @swamp/workflow-summary --workflow <workflow> --json` for
    workflow failures. Run `swamp help report get` to confirm current retrieval
    syntax.

## Skills

**IMPORTANT:** Always load swamp skills, even when in plan mode. The skills
provide essential context for working with this repository.

- `swamp` - Swamp CLI — models, workflows, data, vaults, extensions, publishing,
  repos, reports, issues, and troubleshooting
- `swamp-getting-started` - Interactive onboarding for new swamp users

## Getting Started

**IMPORTANT:** At the start of every conversation, run
`swamp model search --json`. If no models are returned (empty result), you MUST
immediately invoke the `swamp-getting-started` skill before doing anything else.
This walks new users through an interactive onboarding tutorial.

If models already exist, start by using the `swamp` skill to work with swamp
models.

## Commands

Use `swamp --help` to see available commands. For a machine-readable JSON schema
of the CLI (commands, options, arguments) intended for agent consumption, run
`swamp help [<command>...]` — e.g. `swamp help` returns the full tree, and
`swamp help model method run` scopes to a subtree.

<!-- END swamp managed section -->

# AGENTS.md

## Purpose

Guide for coding agents working in this repo. Use repo commands, follow existing
patterns, and keep edits focused. Prefer nearby conventions over new
abstractions.

## Stack Snapshot

- React Router 8 (framework mode), React 19, TypeScript, Vite+ 1.4
- Package manager: `pnpm` (`pnpm-lock.yaml`)
- Runtime: Node `>=24` (Volta pins Node 24.13.1)
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
- Config: `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`,
  `eslint.config.mjs`

## Setup

- Install deps: `pnpm install`
- Copy `.env.example` to `.env` and add local values
- Start Redis: `docker-compose up -d`
- Optional Inngest server: `npx inngest-cli@latest dev`
- Start app: `pnpm dev` (usually `http://localhost:8080`)

### Environment files

- `.env` is plaintext, ignored, and only for local development
- `.env.production` is encrypted with dotenvx and committed
- `.env.keys` is ignored and backed up in 1Password
- Fly receives only `DOTENV_PRIVATE_KEY_PRODUCTION`
- Never use values from `.env` to populate `.env.production`

## Build/Lint/Typecheck/Test

### Core commands

- Clean: `pnpm clean`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Start prod: `pnpm start`
- Lint: `pnpm lint`
- Full format/lint/type gate: `pnpm check`
- Typecheck: `pnpm typecheck`
- Format: `pnpm format`
- Extra checks: `pnpm knip`
- Diagram assets: `pnpm diagrams:check`

### Test status

- Runner: Vite+ bundled Vitest (`vitest.config.ts`, imports `vite-plus/test`)
- Full suite: `pnpm test` (`vp test run`)
- Current coverage is a small smoke suite in `tests/smoke/*.test.ts`

### Running a single test

- File: `pnpm test:single tests/smoke/health-route.test.ts`
- Test name: `pnpm test:single tests/smoke/env.server.test.ts -t "fallback"`
- Environment startup: `pnpm test:single tests/smoke/startup-env.test.ts`
- Newsletter RSS cache: `pnpm test:single tests/smoke/newsletter-rss.test.ts`
- Mobile navbar focus: `pnpm test:single tests/navbar-focus-trap.test.ts`
- Shortcut preferences and rebinding: `pnpm test:single tests/hotkeys.test.ts`
- Lazy search shortcuts: `pnpm test:single tests/search-hotkeys.test.ts`
- Article TOC shortcuts: `pnpm test:single tests/toc-hotkeys.test.ts`
- Deploy config: `pnpm test:single tests/smoke/deploy-config.test.ts`
- Swamp audit plugin: `pnpm test:single tests/smoke/swamp-audit-plugin.test.ts`
- Hook/staging/CI policy:
  `pnpm test:single tests/smoke/developer-tooling.test.ts`
- Non-interactive Plop TIL generation:
  `pnpm test:single tests/smoke/create-til.test.ts`
- Swamp TIL adapter (Deno, checked separately from app TypeScript):
  `~/.swamp/deno/deno test --no-config -A extensions/models/til_test.ts`

### Creating a TIL with swamp

- The `@tearingitup786/til` model uses `plopfile.cjs` and
  `plop-templates/til.mdx.hbs`; do not duplicate the template.
- Run `swamp model method run til create --input '<JSON>' --json` with `title`,
  `date` (`YYYY-MM-DD`), `tag`, `content`, and `sourceUrl` (HTTP/HTTPS) in the
  JSON object. The model appends a final `[Check it out](sourceUrl)` link;
  supply only the body in `content`.
- Preserve the author's words with barely any changes. Do not rewrite notes into
  generic prose, add filler, or invent personal experiences. Read existing TILs
  for context and existing tags, but the author's supplied wording wins. Make
  only minimal edits needed for clarity or Markdown formatting.
- Use a supplied source URL or verify the relevant source; never guess a link.
- If the `til` instance is missing, create it with
  `swamp model create @tearingitup786/til til --json`.
- Node and `pnpm install` are required. Existing posts are never overwritten.
- The created path and inputs are recorded in the `post` data spec, instance
  `created`. No publishing, git commits, or content refresh is performed.

### Targeted command pattern

- Native lint one file: `pnpm exec vp lint app/routes/_index.tsx`
- Full lint (including compatibility rules): `pnpm lint`
- Typecheck is project-wide (`tsc -b .`), so use `pnpm typecheck`

## Pre-commit and CI

- Husky checks staged Mermaid MDX first, then runs `pnpm exec vp staged`
- Missing/stale diagram assets invoke the project OpenCode
  `update-blog-diagrams` command and stop the commit for artwork review
- Staged checks format supported files and lint scripts without whole-project
  type analysis; preserve partially staged edits. No clean or full test suite.
- Every pull request runs `pnpm check`, `pnpm test`, and `pnpm diagrams:check`
- CI validates diagrams before deploys and content-only refreshes

## Code Style Guidelines

### Formatting and linting

- Oxfmt and native Oxlint configuration live in `vite.config.ts`
- Narrow ESLint compatibility rules live in `eslint.config.mjs` (import order,
  Epic Web disposal, Playwright); full checks only, not staged commits
- Keep `tsc -b` in full checks; Vite+ type diagnostics are supplementary
- Staged lint shares native rules via `other/staged-lint.config.ts` with type
  analysis disabled; do not replace custom dev/build scripts with generic `vp`
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
- Mermaid fences remain canonical; generated `mermaid-{hash}.svg` files live
  beside their MDX file and must never be placed in `public/`
- To regenerate explicitly, run the OpenCode `update-blog-diagrams` command or
  ask an agent to "update the blog diagrams"

## Cursor/Copilot Rules

- Checked `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`
- No Cursor or Copilot instruction files were found

## Agent Working Agreement

- Make minimal, targeted changes
- Avoid bundling broad refactors with feature/fix work
- Keep server/client boundaries intact (`.server` must not leak client-side)
- After non-trivial edits, run `pnpm lint` and `pnpm typecheck`
- If you add tests, add full-suite + single-test commands and update this file
- After Mermaid changes, run `pnpm diagrams:check`

## Design Context

### Users

- Primary: Other software developers reading technical content
- Context: Reading on desktop or mobile, often during work breaks or personal
  learning time
- Job to be done: Find useful technical content quickly, browse TILs, stay
  updated on posts

### Brand Personality

- **Playful developer** - voice that feels like a real person, not a content
  machine
- Confident monospace choice signals technical identity without apology
- Humor and personality (Giphy errors, random quotes, easter eggs) is
  intentional, not accidental

### Aesthetic Direction

- **Monospace-only typography**: CommitMono as the single font family - bold
  choice that works
- **Pink accent**: hsl(322, 83%, 57%) is the only color beyond neutrals - commit
  to it
- **Dark + light modes**: Both supported, no "default" - user preference wins
- **Anti-patterns to avoid**:
  - No gradient text
  - No glassmorphism
  - No hero metric layouts
  - No generic shadows or glowing effects
  - No centered-container everything

### Design Principles

1. **Personality first** - If a choice makes the site feel more like a real
   person, do it
2. **Technical identity** - The monospace font IS the brand; lean into it, don't
   soften it
3. **Pink is enough** - One accent color is stronger than five; resist adding
   more
4. **Avoid the template** - If it's a pattern you'd see on 100 AI-generated
   sites, reject it
5. **Motion with purpose** - Every animation should feel intentional, not
   decorative
