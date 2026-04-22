# Dependency Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Remove only the dependencies that `npx fallow dead-code` flags and the
repo evidence confirms are unused.

**Architecture:** Use `fallow` as the candidate generator, then validate each
flagged package against imports, scripts, config, and tooling files before any
removal. Keep the change limited to dependency manifests and only run broader
verification if the removed package was part of build or runtime plumbing.

**Tech Stack:** pnpm, Node 24, React Router, TypeScript, ESLint, Vitest

---

### Task 1: Collect and Verify Dead Dependency Candidates

**Files:**

- Modify: `package.json`
- Reference: `docs/plans/2026-04-22-dependency-cleanup-design.md`
- Reference: `vite.config.ts`
- Reference: `eslint.config.mjs`
- Reference: `lint-staged.config.mjs`
- Reference: `plopfile.cjs`

**Step 1: Run the requested analyzer**

Run: `npx fallow dead-code`

Expected: a list of dependency candidates that may be unused.

**Step 2: Verify each candidate in tracked files**

Search for each reported package name across source, config, tests, scripts, and
tooling files.

Expected: each candidate is classified as either "used somewhere in repo" or "no
credible in-repo usage found."

**Step 3: Produce the final removal list**

Keep only the candidates with no credible in-repo usage.

Expected: a short, defensible list of packages to remove.

### Task 2: Remove Confirmed Unused Dependencies

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Step 1: Remove only confirmed unused packages**

Run: `pnpm remove <confirmed-packages>`

Expected: `package.json` and `pnpm-lock.yaml` update cleanly.

**Step 2: Inspect the manifest diff**

Confirm only the intended packages were removed.

Expected: no unrelated manifest or lockfile churn beyond dependency resolution.

### Task 3: Verify the Cleanup

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Step 1: Run lint**

Run: `pnpm lint`

Expected: PASS.

**Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

**Step 3: Run targeted extra verification if needed**

If a removed package affected build or server tooling, run: `pnpm build`

Expected: PASS or a concrete failure tied to an incorrect removal decision.

**Step 4: Commit if requested**

Only create a git commit if the user explicitly asks for one.
