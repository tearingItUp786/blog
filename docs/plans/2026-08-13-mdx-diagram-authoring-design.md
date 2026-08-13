# MDX Diagram Authoring Design

## Goal

Keep fenced Mermaid inside MDX as the canonical diagram source while rendering
reviewed, diagram-design SVGs whenever a matching sibling asset is available.

## Source And Assets

Mermaid source is normalized before hashing: line endings become LF, trailing
spaces and tabs are removed, outer blank lines are removed, and common
indentation is removed from nonblank lines. Internal spacing and blank lines
remain significant. The first 12 lowercase hexadecimal characters of the SHA-256
digest form `mermaid-{hash}.svg`.

Generated files remain beside their MDX file under `content/`. The existing
GitHub GraphQL query already returns direct sibling blobs as text, so it does
not need a schema or query change.

## Compilation

A rehype plugin runs immediately before `rehype-mermaid`. It locates Mermaid
code blocks, computes their asset names, and looks up sibling SVG text in the
GitHub file map. Valid assets become inline HAST SVG nodes in compiled MDX.
Missing or invalid assets remain unchanged and continue through
`rehypeMermaid({ strategy: 'pre-mermaid' })` to the existing browser renderer.

SVG parsing is fail-closed. It permits a diagram-oriented element and property
allowlist, rejects active content and external references, requires useful
accessibility metadata, and namespaces all IDs and local references per post,
hash, and occurrence.

## Authoring And Validation

`pnpm diagrams:check` deterministically scans content, verifies expected assets,
reports missing, invalid, and orphaned SVGs, and never invokes an agent or the
network. CI runs it before both application deploys and content-only refreshes.

The pre-commit hook checks staged MDX before lint-staged. Missing or stale
assets invoke the project OpenCode `update-blog-diagrams` command, which uses
the installed diagram-design skill with this blog's CommitMono, pink, and
neutral brand profile. The hook stops after generation so artwork can be
reviewed and staged before retrying the commit.

## Cache Refresh

Sibling SVG changes resolve to their containing blog slug. Added, modified,
deleted, and moved diagram assets invalidate the individual cached page before
GitHub-backed recompilation.
