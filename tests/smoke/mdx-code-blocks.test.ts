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
	it('compiles code blocks with Shiki titles, dual theme tokens, and highlighted lines', async () => {
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
`),
		])

		expect(page).not.toBeNull()
		const code = page?.code ?? ''

		expect(code).toContain('custom-code-title')
		expect(code).toContain('example.js')
		expect(code).toContain('shiki')
		expect(code).toContain('--shiki-light')
		expect(code).toContain('--shiki-dark')
		expect(code.match(/highlighted/g)).toHaveLength(2)
	})
})
