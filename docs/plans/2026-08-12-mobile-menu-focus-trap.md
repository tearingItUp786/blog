# Mobile Menu Focus Trap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Trap keyboard focus inside the open mobile navigation, support Escape,
and restore focus to the hamburger trigger.

**Architecture:** Wrap the mobile navigation surface and trigger in
`focus-trap-react`, with the existing `Navbar` state controlling activation.
Keep the panel mounted for its current animation, use refs for initial and
return focus, and disable the trap at the desktop breakpoint.

**Tech Stack:** React 19, TypeScript, React Router, `focus-trap-react`, Vitest,
jsdom

---

### Task 1: Add Focus Trap Test Infrastructure

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `tests/navbar-focus-trap.test.ts`

1. Add `focus-trap-react` as a runtime dependency and `jsdom` as a test
   dependency.
2. Write a jsdom test that opens the menu and verifies initial focus.
3. Run the test and confirm it fails before implementation.

### Task 2: Implement the Responsive Focus Trap

**Files:**

- Modify: `app/components/navbar/navbar.tsx`
- Modify: `app/components/navbar/mobile.tsx`
- Test: `tests/navbar-focus-trap.test.ts`

1. Add refs for the menu panel, controls, first link, and hamburger button.
2. Connect the trigger and navigation landmark with `aria-controls` and a stable
   ID.
3. Trap focus across the menu panel and hamburger wrapper only on mobile.
4. Configure initial focus, Escape closure, focus restoration, and route-change
   closure.
5. Clean up media-query listeners and scroll-lock classes.

### Task 3: Verify the Change

1. Run
   `pnpm test:single tests/navbar-focus-trap.test.ts tests/smoke/navbar-stacking.test.ts`.
2. Run Prettier on changed files.
3. Run `pnpm lint && pnpm typecheck`.
4. Run `pnpm test`.
5. Run React diagnostics and a changed-file audit.
