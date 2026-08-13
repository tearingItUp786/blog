# MDX Diagram Authoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Render polished sibling SVGs for canonical Mermaid fences without AI
or browser work during builds, requests, or MDX compilation.

**Architecture:** Share deterministic Mermaid extraction and hashing between a
checker, pre-commit authoring workflow, and compile-time rehype plugin. Parse
and namespace generated SVG into safe HAST while retaining the existing Mermaid
renderer as the missing/invalid fallback.

**Tech Stack:** TypeScript, mdx-bundler, rehype, HAST, Vitest, OpenCode,
diagram-design, GitHub Actions

---

### Task 1: Source Contract

- Create `app/utils/mermaid-diagrams.ts`.
- Test normalization, hashing, multiple fences, changed source, and orphans in
  `tests/mermaid-diagrams.test.ts`.

### Task 2: SVG Trust Boundary

- Add direct HAST parser dependencies.
- Create `app/utils/generated-svg.server.ts`.
- Test accessibility, prohibited content, malformed input, references, and ID
  namespacing in `tests/generated-svg.test.ts`.

### Task 3: MDX Integration

- Create `app/utils/rehype-generated-mermaid.server.ts`.
- Register it before rehype-mermaid in `app/utils/mdx.server.ts`.
- Add responsive generated-SVG styles to `app/styles/app.css`.
- Extend `tests/smoke/mdx-code-blocks.test.ts` for static and fallback paths.

### Task 4: Deterministic Validation

- Create `other/check-diagrams.ts` and the `diagrams:check` package script.
- Test missing, orphaned, malformed, and current assets in
  `tests/check-diagrams.test.ts`.

### Task 5: Content Refresh And CI

- Fix sibling-asset slug extraction and invalidation in the Inngest refresh
  helpers.
- Add a diagram job that gates deploy and content-only refresh.
- Extend refresh and deploy smoke tests.

### Task 6: Pre-commit Authoring

- Create `.opencode/command/update-blog-diagrams.md`.
- Create `other/precommit-diagrams.ts` and invoke it before lint-staged.
- Stop after generated assets change so they can be reviewed and staged.

### Task 7: Migration And Verification

- Generate four sibling SVGs for the existing Mermaid fences with the installed
  diagram-design skill.
- Run `pnpm diagrams:check`, `pnpm test`, `pnpm typecheck`, and `pnpm lint`.
