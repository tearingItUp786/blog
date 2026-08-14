import { describe, expect, it } from 'vitest'

import { type GithubGraphqlObject } from '~/schemas/github'
import { compileMdxForGraphql } from '~/utils/mdx.server'
import { getMermaidAssetName } from '~/utils/mermaid-diagrams'

function createMdxFile(text: string): GithubGraphqlObject {
	return {
		name: 'index.mdx',
		object: { text },
	}
}

function createFile(name: string, text: string): GithubGraphqlObject {
	return { name, object: { text } }
}

function createGeneratedSvg(label: string) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" role="img" aria-labelledby="diagram-title diagram-desc">
  <title id="diagram-title">${label}</title>
  <desc id="diagram-desc">Generated diagram description.</desc>
  <defs><marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" /></marker></defs>
  <path d="M 40 40 H 920" marker-end="url(#arrow)" />
</svg>`
}

describe('MDX code block smoke tests', () => {
	it('compiles code blocks with Shiki titles, aliases, single-theme output, and highlighted lines', async () => {
		const page = await compileMdxForGraphql('shiki-smoke', [
			createMdxFile(`---
title: Shiki Smoke
date: 2026-04-28
tag: Test
---

\`\`\`JavaScript:title=example.js {1-2}
const value = 1
console.log(value)
\`\`\`

\`\`\`CSS:title=styles.css
.demo {
	color: hotpink;
}
\`\`\`

\`\`\`TSX:title=button.tsx
type Props = { label: string }

export function Button({ label }: Props) {
	return <button>{label}</button>
}
\`\`\`

\`\`\`Go:title=main.go
package main

func main() {}
\`\`\`

\`\`\`PHP:title=index.php
<?php echo 'hi';
\`\`\`
`),
		])

		expect(page).not.toBeNull()
		const code = page?.code ?? ''

		expect(code).toContain('custom-code-title')
		expect(code).toContain('example.js')
		expect(code).toContain('styles.css')
		expect(code).toContain('button.tsx')
		expect(code).toContain('main.go')
		expect(code).toContain('index.php')
		expect(code).toContain('shiki')
		expect(code).toContain('laserwave')
		expect(code).toContain('#27212e')
		expect(code).not.toContain('--shiki-light')
		expect(code).not.toContain('--shiki-dark')
		expect(code.match(/highlighted/g)).toHaveLength(2)
	}, 15_000)

	it('preserves Shiki default tokenization for top-level CSS declarations', async () => {
		const page = await compileMdxForGraphql('shiki-css-declarations', [
			createMdxFile(`---
title: CSS Declarations
date: 2026-04-29
tag: Test
---

\`\`\`css {1-2}
display: grid;
place-items: center;
\`\`\`
`),
		])

		expect(page).not.toBeNull()
		const code = page?.code ?? ''

		expect(code).toContain('children:"display: grid;"')
		expect(code).toContain('children:"place-items"')
	}, 15_000)

	it('embeds a matching generated Mermaid SVG instead of the browser fallback', async () => {
		const mermaid = 'sequenceDiagram\n    User->>Server: Request'
		const assetName = getMermaidAssetName(mermaid)
		const page = await compileMdxForGraphql('blog/generated-mermaid', [
			createMdxFile(`---
title: Generated Mermaid
date: 2026-08-13
tag: Test
---

\`\`\`mermaid
${mermaid}
\`\`\``),
			createFile(assetName, createGeneratedSvg('Generated request path')),
		])

		const code = page?.code ?? ''
		expect(code).toContain('generated-mermaid-scroll')
		expect(code).toContain('"aria-label":"Diagram"')
		expect(code).toContain('role:"region"')
		expect(code).toContain('generated-mermaid')
		expect(code).toContain('Generated request path')
		expect(code).toContain('viewBox:"0 0 960 600"')
		expect(code).not.toContain('className:"mermaid"')
	}, 15_000)

	it('embeds generated Mermaid SVGs nested inside MDX JSX elements', async () => {
		const mermaid = 'sequenceDiagram\n    User->>Server: Wrapped request'
		const assetName = getMermaidAssetName(mermaid)
		const page = await compileMdxForGraphql('blog/wrapped-mermaid', [
			createMdxFile(`---
title: Wrapped Mermaid
date: 2026-08-13
tag: Test
---

<div className="my-8">

\`\`\`mermaid
${mermaid}
\`\`\`

</div>`),
			createFile(assetName, createGeneratedSvg('Wrapped request path')),
		])

		const code = page?.code ?? ''
		expect(code).toContain('generated-mermaid-scroll')
		expect(code).toContain('generated-mermaid')
		expect(code).toContain('Wrapped request path')
		expect(code).not.toContain('className:"mermaid"')
	}, 15_000)

	it('keeps the current Mermaid fallback when a generated SVG is missing', async () => {
		const page = await compileMdxForGraphql('blog/missing-mermaid', [
			createMdxFile(`---
title: Missing Mermaid
date: 2026-08-13
tag: Test
---

\`\`\`mermaid
graph LR
    A --> B
\`\`\``),
		])

		const code = page?.code ?? ''
		expect(code).toContain('className:"mermaid"')
		expect(code).toContain('graph LR')
		expect(code).not.toContain('generated-mermaid-scroll')
		expect(code).not.toContain('generated-mermaid')
	}, 15_000)

	it('keeps the fallback when a matching generated SVG is invalid', async () => {
		const mermaid = 'graph LR\n    A --> B'
		const page = await compileMdxForGraphql('blog/invalid-mermaid', [
			createMdxFile(`---
title: Invalid Mermaid
date: 2026-08-13
tag: Test
---

\`\`\`mermaid
${mermaid}
\`\`\``),
			createFile(
				getMermaidAssetName(mermaid),
				'<svg viewBox="0 0 10 10"><script>alert(1)</script></svg>',
			),
		])

		const code = page?.code ?? ''
		expect(code).toContain('className:"mermaid"')
		expect(code).not.toContain('alert(1)')
	}, 15_000)

	it('embeds multiple diagrams with unique SVG ID namespaces', async () => {
		const first = 'graph LR\n    A --> B'
		const second = 'sequenceDiagram\n    A->>B: Hello'
		const page = await compileMdxForGraphql('blog/multiple-mermaid', [
			createMdxFile(`---
title: Multiple Mermaid
date: 2026-08-13
tag: Test
---

\`\`\`mermaid
${first}
\`\`\`

\`\`\`typescript
const mermaid = true
\`\`\`

\`\`\`mermaid
${second}
\`\`\``),
			createFile(getMermaidAssetName(first), createGeneratedSvg('First')),
			createFile(getMermaidAssetName(second), createGeneratedSvg('Second')),
		])

		const code = page?.code ?? ''
		expect(code.match(/className:"generated-mermaid"/g)).toHaveLength(2)
		expect(code).toContain('multiple-mermaid-mermaid-')
		expect(code).toContain('-0-diagram-title')
		expect(code).toContain('-1-diagram-title')
		expect(code).toContain('className:"language-typescript"')
		expect(code).toContain('children:" mermaid"')
	}, 15_000)
})
