# Shiki Code Block Spacing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Restore Prism-style code block spacing and full-row line highlights
without changing the Shiki MDX pipeline.

**Architecture:** Keep the fix localized to the shared Shiki stylesheet and add
one regression test that locks in the desired CSS contract. Do not change MDX
rendering or language handling.

**Tech Stack:** React Router, TypeScript, Vite, Shiki, Vitest, Tailwind CSS,
pnpm

---

### Task 1: Add a Failing CSS Regression Test

**Files:**

- Create: `tests/smoke/code-block-styles.test.ts`
- Reference: `app/styles/code-blocks.css`

**Step 1: Write the failing test**

Add a Vitest test that reads `app/styles/code-blocks.css` and asserts the file:

- contains `pre.shiki .line.highlighted {`
- does not contain `.line.highlighted span`

**Step 2: Run test to verify it fails**

Run: `pnpm test:single tests/smoke/code-block-styles.test.ts`

Expected: FAIL because the current stylesheet still applies highlighted
background selectors to nested token spans.

### Task 2: Fix Highlight Presentation in the Shared Shiki Stylesheet

**Files:**

- Modify: `app/styles/code-blocks.css`

**Step 1: Remove nested highlighted span selectors**

Update the light and dark highlighted-line selectors so the background applies
only to `.line.highlighted`.

**Step 2: Add branded focus-visible styling**

Add a pink `pre.shiki:focus-visible` outline so keyboard focus matches the site
design system instead of the browser default ring.

**Step 3: Run the targeted test**

Run: `pnpm test:single tests/smoke/code-block-styles.test.ts`

Expected: PASS.

### Task 3: Verify the Full Change

**Files:**

- Modify: `app/styles/code-blocks.css`
- Test: `tests/smoke/code-block-styles.test.ts`
- Test: `tests/smoke/mdx-code-blocks.test.ts`

**Step 1: Run targeted smoke tests**

Run:

- `pnpm test:single tests/smoke/code-block-styles.test.ts`
- `pnpm test:single tests/smoke/mdx-code-blocks.test.ts`

Expected: PASS.

**Step 2: Run full tests**

Run: `pnpm test`

Expected: PASS.

**Step 3: Run lint**

Run: `pnpm lint`

Expected: PASS with only any pre-existing warnings.

**Step 4: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

**Step 5: Commit if requested**

Only create a git commit if the user explicitly asks for one.
