# Dependency Cleanup Design

## Goal

Use `npx fallow dead-code` to identify unused packages, verify each candidate
against the repo, and remove only dependencies that are convincingly unused.

## Context

- This repo is a single `pnpm` project with runtime, build, lint, and content
  tooling all declared in one `package.json`.
- Some packages may be referenced outside normal imports, including package
  scripts, config files, and code generation or local tooling entrypoints.
- The cleanup should be conservative: keep anything that appears to be used in
  tracked project files or scripts.

## Options Considered

### 1. `fallow` first, then manual verification, then targeted removal

Run `npx fallow dead-code` to produce candidates, then verify every flagged
package across source files, config, tests, and scripts before removing only the
confirmed unused ones.

Why this wins:

- Starts from the tool the user requested.
- Keeps the cleanup grounded in repo evidence instead of guesswork.
- Minimizes the risk of removing packages used indirectly by tooling.

### 2. Full repo search before using `fallow`

Build a dependency review from imports, requires, and config references first,
then compare that list with `fallow`.

Why this was rejected:

- More work without improving the safety of this specific cleanup much.
- Still needs the same manual verification step before removal.

### 3. Remove most packages flagged by `fallow`

Treat `fallow` output as authoritative unless a usage is immediately obvious.

Why this was rejected:

- Too risky for packages used through scripts, config, or manual tooling.
- Conflicts with the requested conservative scope.

## Final Design

1. Run `npx fallow dead-code` and capture the reported unused dependencies.
2. Verify each flagged package across:
   - application and server code
   - tests and mocks
   - package scripts
   - config files and generator tooling
3. Remove only the dependencies with no credible in-repo usage.
4. Update `package.json` and `pnpm-lock.yaml` with `pnpm remove`.
5. Run core verification commands after the cleanup.

## Verification

- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run an additional targeted command such as `pnpm build` if the removed package
  affected build or runtime tooling.
