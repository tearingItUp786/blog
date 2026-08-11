import { describe, expect, it } from 'vitest'

import { type GithubGraphqlObject } from '~/schemas/github'
import { compileMdxForGraphql, queuedCompileMdxGql } from '~/utils/mdx.server'

function createMdxFile(text: string): GithubGraphqlObject {
	return {
		name: 'index.mdx',
		object: { text },
	}
}

describe('MDX headings', () => {
	it('extracts h2 and h3 headings with their rendered slugs and text', async () => {
		const page = await compileMdxForGraphql('heading-smoke', [
			createMdxFile(`---
title: Heading Smoke
date: 2026-07-16
tag: Test
---

## **First Section**

### \`Using inlineCode()\`

## Repeat

## Repeat

#### Not In The Table Of Contents
`),
		])

		expect(page?.headings).toEqual([
			{ id: 'first-section', text: 'First Section', depth: 2 },
			{ id: 'using-inlinecode', text: 'Using inlineCode()', depth: 3 },
			{ id: 'repeat', text: 'Repeat', depth: 2 },
			{ id: 'repeat-1', text: 'Repeat', depth: 2 },
		])
	}, 15_000)

	it('preserves an empty compiler result when no MDX file exists', async () => {
		await expect(queuedCompileMdxGql('missing-mdx', [])).resolves.toBeNull()
	})
})
