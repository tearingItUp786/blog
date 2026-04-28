# Shiki Code Blocks Design

## Goal

Replace the current Prism-based MDX code highlighting with Shiki while making
code blocks respond to the site's light and dark themes.

## Context

- MDX is compiled in `app/utils/mdx.server.ts` with `mdx-bundler`.
- Code titles currently come from `rehype-code-titles` using the `:title=` fence
  convention.
- Syntax highlighting currently comes from `rehype-prism-plus` with global CSS
  in `app/styles/new-prisma-theme.css`.
- Content already uses line-highlight metadata such as `{5-8}` and language
  names in mixed case such as `JavaScript`, `CSS`, `JSON`, and `Scala`.
- Theme state is class-based: `app/root.tsx` renders `html.light` or `html.dark`
  and sets `data-theme` to the same value.

## Options Considered

### 1. Official Shiki rehype plugin with Shiki transformers

Use `@shikijs/rehype` in the existing rehype plugin chain and add
`@shikijs/transformers` for metadata-driven line highlighting.

Why this wins:

- It is the official Shiki integration and tracks current Shiki behavior.
- It keeps the migration focused on the MDX compiler and code-block CSS.
- It supports dual themes using Shiki CSS variables and the existing
  `data-theme`/class theme system.
- It can preserve current title and line-highlight authoring conventions.

### 2. `rehype-pretty-code`

Use `rehype-pretty-code`, which is also Shiki-powered and provides a
higher-level MDX-focused API.

Why this was rejected:

- It adds another abstraction when the official Shiki plugin is enough.
- The current site already owns its code block styling and does not need a
  larger opinionated wrapper.
- The official plugin is a better fit for current Shiki versions.

### 3. Custom Shiki renderer outside rehype

Manually find code blocks and run Shiki directly before or after MDX bundling.

Why this was rejected:

- It would duplicate work that rehype already handles.
- It increases the risk of MDX/HAST edge cases and title/highlight regressions.
- It is more code for no clear benefit.

## Final Design

1. Replace `rehype-prism-plus` with `@shikijs/rehype` in
   `app/utils/mdx.server.ts`.
2. Configure Shiki with dual themes. Start with `vitesse-light` and
   `vitesse-dark` because they are readable, restrained, and compatible with a
   neutral/pink design system.
3. Use `defaultColor: false` so CSS controls the active colors from Shiki's
   generated variables.
4. Add CSS for `[data-theme='light'] .shiki` and `[data-theme='dark'] .shiki` so
   tokens switch with the existing theme toggle.
5. Preserve current authoring conventions:
   - Keep `rehype-code-titles` for `:title=` fences.
   - Add `transformerMetaHighlight()` for `{2-3}` line highlights.
   - Use CSS counters for line numbers instead of Prism-generated line-number
     markup.
   - Add language aliases for existing mixed-case fences.
6. Replace Prism-specific CSS with a Shiki-specific stylesheet and update the
   root import.
7. Remove `rehype-prism-plus` and stale Prism declarations once no imports
   remain.

## Verification

- Add or update a smoke test that compiles MDX with a title, line highlight, and
  mixed-case language alias.
- Run the targeted smoke test.
- Run `pnpm test`.
- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run `pnpm build` to catch MDX compilation issues across real content.
