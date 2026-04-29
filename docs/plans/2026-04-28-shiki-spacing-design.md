# Shiki Code Block Spacing Design

## Goal

Restore the old Prism-style code block spacing and highlighted-line presentation
while keeping the Shiki migration intact.

## Context

- Code blocks are now rendered by Shiki from `app/utils/mdx.server.ts`.
- Shared code block styles live in `app/styles/code-blocks.css`.
- The old Prism presentation used full-row highlighted lines and tighter line
  spacing with inline line numbers.
- The current Shiki CSS applies highlighted backgrounds to both the `.line`
  wrapper and nested token spans, which breaks the old contiguous highlighted
  block appearance.

## Options Considered

### 1. Normalize the existing Shiki CSS

Keep Shiki output as-is and make the stylesheet match the older Prism spacing
contract.

Why this wins:

- It is the smallest possible fix.
- It preserves the current MDX pipeline and language support.
- It targets the visual regression directly in one place.

### 2. Add a custom Shiki transformer that emits Prism-like classes

Modify the generated markup so Shiki emits a closer match to the previous Prism
HTML structure.

Why this was rejected:

- It adds unnecessary complexity for a CSS-level regression.
- The current `.line` wrappers already provide enough structure.

## Final Design

1. Keep the existing Shiki MDX integration unchanged.
2. Treat `.line.highlighted` as the only highlighted background surface.
3. Remove highlighted background selectors that target nested token spans.
4. Keep the current full-width line box model with horizontal gutter padding and
   inline line numbers.
5. Add a small branded `:focus-visible` outline so focused code blocks use the
   site's pink accent instead of the browser default blue ring.

## Verification

- Add a regression test that reads `app/styles/code-blocks.css` and asserts:
  - highlighted backgrounds target `.line.highlighted`
  - highlighted backgrounds do not target nested spans
- Run the targeted style regression test and watch it fail before the CSS fix.
- Re-run the targeted test after the CSS fix.
- Run `pnpm test`, `pnpm lint`, and `pnpm typecheck`.
