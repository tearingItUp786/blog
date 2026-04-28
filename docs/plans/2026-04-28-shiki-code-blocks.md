# Shiki Code Blocks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Replace Prism-based MDX code highlighting with Shiki-powered
light/dark code blocks.

**Architecture:** Keep highlighting inside the existing `mdx-bundler` rehype
pipeline. Use official Shiki rehype output with CSS variables, then style
`.shiki` blocks through the site's existing `data-theme` and
`html.light`/`html.dark` theme hooks.

**Tech Stack:** React Router, React 18, TypeScript, Vite, MDX Bundler, pnpm,
Shiki, Vitest, Tailwind CSS

---

### Task 1: Add Shiki Dependencies and Remove Prism Dependency

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Step 1: Update packages**

Run:
`pnpm add @shikijs/rehype @shikijs/transformers && pnpm remove rehype-prism-plus`

Expected: `package.json` replaces `rehype-prism-plus` with Shiki packages and
`pnpm-lock.yaml` updates.

**Step 2: Inspect manifest diff**

Run: `git diff -- package.json pnpm-lock.yaml`

Expected: only dependency and lockfile changes related to the highlighter
migration.

### Task 2: Write a Failing MDX Compile Smoke Test

**Files:**

- Create: `tests/smoke/mdx-code-blocks.test.ts`
- Reference: `app/utils/mdx.server.ts`
- Reference: `app/schemas/github.ts`

**Step 1: Add the test**

Create a Vitest test that calls `compileMdxForGraphql` with one MDX file
containing a title, a mixed-case language name, and `{2}` line-highlight
metadata.

Assert that the compiled `code` string contains:

- `custom-code-title`
- `example.js`
- `shiki`
- `--shiki-light`
- `--shiki-dark`
- `highlighted`

**Step 2: Run test to verify it fails before implementation**

Run: `pnpm test:single tests/smoke/mdx-code-blocks.test.ts`

Expected: FAIL because Prism output does not include Shiki classes or variables.

### Task 3: Replace Prism in the MDX Pipeline

**Files:**

- Modify: `app/utils/mdx.server.ts`
- Modify: `types/remark-plugins.d.ts`

**Step 1: Replace the highlighter imports**

In `compileMdxForGraphql`, replace the dynamic import of `rehype-prism-plus`
with dynamic imports for `@shikijs/rehype` and `@shikijs/transformers`.

**Step 2: Configure Shiki**

Replace `[rehypePrismPlus, { showLineNumbers: true }]` with Shiki configured for
`vitesse-light`, `vitesse-dark`, `defaultColor: false`, `text` fallback/default
language, language aliases, and `transformerMetaHighlight()`.

**Step 3: Remove stale Prism type declaration**

Remove `declare module 'remark-prism'` from `types/remark-plugins.d.ts` if no
usage remains.

**Step 4: Run the targeted test**

Run: `pnpm test:single tests/smoke/mdx-code-blocks.test.ts`

Expected: PASS or a concrete Shiki/MDX integration error to fix.

### Task 4: Replace Prism Styles With Shiki Styles

**Files:**

- Delete: `app/styles/new-prisma-theme.css`
- Modify: `app/root.tsx`
- Create: `app/styles/code-blocks.css`

**Step 1: Create Shiki stylesheet**

Create `app/styles/code-blocks.css` with styles for titles, `.shiki`,
`.shiki code`, `.shiki .line`, CSS-counter line numbers, highlighted lines,
theme selectors, and pink selection color.

**Step 2: Update root import**

Replace `import './styles/new-prisma-theme.css'` with
`import './styles/code-blocks.css'`.

**Step 3: Remove old stylesheet**

Delete `app/styles/new-prisma-theme.css` after the new stylesheet is imported.

**Step 4: Search for stale references**

Search for `new-prisma-theme`, `rehype-prism-plus`, and `remark-prism`.

Expected: no stale references outside docs/plans or lockfile history.

### Task 5: Verify the Migration

**Files:**

- Modify: `app/utils/mdx.server.ts`
- Modify: `app/root.tsx`
- Modify: `app/styles/code-blocks.css`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Test: `tests/smoke/mdx-code-blocks.test.ts`

**Step 1: Run targeted smoke test**

Run: `pnpm test:single tests/smoke/mdx-code-blocks.test.ts`

Expected: PASS.

**Step 2: Run full tests**

Run: `pnpm test`

Expected: PASS.

**Step 3: Run lint**

Run: `pnpm lint`

Expected: PASS.

**Step 4: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

**Step 5: Run production build**

Run: `pnpm build`

Expected: PASS and compile existing MDX content without Shiki language errors.

**Step 6: Commit if requested**

Only create a git commit if the user explicitly asks for one.
