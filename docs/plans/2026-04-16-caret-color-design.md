# Caret Color Design

## Goal

Make text-entry carets use the site accent color everywhere so inputs feel
consistent with the rest of the design system.

## Context

- The site already defines the accent as `var(--accent)` in `app/tailwind.css`.
- Global element defaults live in `app/styles/app.css` under `@layer base`.
- Visible text-entry controls already share accent-based focus styles in several
  places, so the caret should use the same token instead of a one-off value.

## Options Considered

### 1. Global base rule for text-entry controls

Add `caret-color: var(--accent)` to a base rule covering `input` and `textarea`.

Why this wins:

- Matches the requested global scope.
- Keeps the styling tied to the existing semantic accent token.
- Avoids repeating the same class across components.

### 2. Utility class applied per component

Add a reusable utility and wire it into each input manually.

Why this was rejected:

- More work for a global design decision.
- Easier to miss inputs and drift over time.

### 3. Tailwind classes on each input

Apply caret styling inline in each component.

Why this was rejected:

- Spreads a shared visual rule across multiple files.
- Adds maintenance overhead without improving flexibility.

## Final Design

Add a base-layer rule in `app/styles/app.css`:

- Target `input` and `textarea`
- Set `caret-color: var(--accent)`

This intentionally does not change text color, borders, placeholders, or focus
outlines.

## Verification

- Confirm the stylesheet builds successfully.
- Manually verify text carets in existing text inputs, including newsletter and
  search.
