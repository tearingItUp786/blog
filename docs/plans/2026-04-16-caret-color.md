# Caret Color Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task.

**Goal:** Make all text-entry carets use the existing accent token globally.

**Architecture:** Reuse the existing semantic accent variable and add one global
base-layer rule in the shared stylesheet. Keep the change centralized so all
current and future text inputs inherit it automatically.

**Tech Stack:** React Router, TypeScript, Tailwind v4, global CSS in
`app/styles/app.css`

---

### Task 1: Add Global Caret Styling

**Files:**

- Modify: `app/styles/app.css`
- Reference: `app/tailwind.css`

**Step 1: Inspect the existing base styles**

Confirm `app/styles/app.css` already contains the shared `@layer base` rules and
that `app/tailwind.css` defines `--accent`.

**Step 2: Write the minimal implementation**

Add this rule to the base layer:

```css
input,
textarea {
	caret-color: var(--accent);
}
```

**Step 3: Verify the app still builds**

Run: `pnpm build`

Expected: the build completes successfully without CSS errors.

**Step 4: Manually verify visible inputs**

Check existing text-entry controls such as the newsletter form and search UI in
the browser. The caret should use the accent color in both light and dark
themes.

**Step 5: Commit if requested**

Only create a git commit if the user explicitly asks for one.
