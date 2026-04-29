import { describe, expect, it } from 'vitest'

import { type GithubGraphqlObject } from '~/schemas/github'
import { compileMdxForGraphql } from '~/utils/mdx.server'

function createMdxFile(text: string): GithubGraphqlObject {
	return {
		name: 'index.mdx',
		object: { text },
	}
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
})
