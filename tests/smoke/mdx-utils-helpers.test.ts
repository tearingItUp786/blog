import { describe, expect, it } from 'vitest'

import { type GithubGraphqlObject, type MdxPage } from '~/schemas/github'
import {
	buildTagCounts,
	getGithubGqlObjForMdx,
	groupTagCountsByInitial,
	mapFromMdxPageToMdxListItem,
} from '~/utils/mdx-utils-helpers.server'

function makeBlob(name: string, text: string): GithubGraphqlObject {
	return { name, object: { text } }
}

function makeTree(
	name: string,
	entries: GithubGraphqlObject[],
): GithubGraphqlObject {
	return { name, object: { entries } }
}

describe('getGithubGqlObjForMdx', () => {
	it('wraps a blob entry with its own name and files array', () => {
		const entry = makeBlob('my-post.mdx', '---\ntitle: Hello\n---\n')
		const result = getGithubGqlObjForMdx(entry)
		expect(result).toEqual({ name: 'my-post.mdx', files: [entry] })
	})

	it('uses directory entries for tree-type objects', () => {
		const child = makeBlob('index.mdx', '# Hello')
		const entry = makeTree('post-dir', [child])
		const result = getGithubGqlObjForMdx(entry)
		expect(result.name).toBe('post-dir')
		expect(result.files).toEqual([child])
	})
})

describe('buildTagCounts', () => {
	it('counts tags from top-level blob entries', () => {
		const entries = [
			makeBlob('a.mdx', '---\ntag: react\n---'),
			makeBlob('b.mdx', '---\ntag: typescript\n---'),
			makeBlob('c.mdx', '---\ntag: react\n---'),
		]
		expect(buildTagCounts(entries)).toEqual({ react: 2, typescript: 1 })
	})

	it('normalizes tag case and trims whitespace', () => {
		const entries = [makeBlob('a.mdx', '---\ntag: React \n---\n# Content')]
		expect(buildTagCounts(entries)).toEqual({ react: 1 })
	})

	it('looks inside tree entries for the first mdx file', () => {
		const entries = [
			makeTree('dir', [
				makeBlob('readme.md', '## Readme'),
				makeBlob('index.mdx', '---\ntag: go\n---'),
			]),
		]
		expect(buildTagCounts(entries)).toEqual({ go: 1 })
	})

	it('skips entries with no mdx content', () => {
		const entries = [
			makeTree('dir', [makeBlob('readme.md', '## Readme')]),
			makeBlob('no-frontmatter.mdx', '# No tag here'),
			makeBlob('empty-tag.mdx', '---\ntag:\n---\n'),
		]
		expect(buildTagCounts(entries)).toEqual({})
	})
})

describe('groupTagCountsByInitial', () => {
	it('groups tags by first letter', () => {
		const counts = { react: 2, rust: 1, typescript: 3 }
		const result = groupTagCountsByInitial(counts)
		expect(result).toEqual([
			[
				'R',
				[
					{ name: 'react', value: 2 },
					{ name: 'rust', value: 1 },
				],
			],
			['T', [{ name: 'typescript', value: 3 }]],
		])
	})

	it('sorts groups by letter', () => {
		const counts = { go: 1, css: 2, awk: 1 }
		const result = groupTagCountsByInitial(counts)
		const letters = result.map(([letter]) => letter)
		expect(letters).toEqual(['A', 'C', 'G'])
	})
})

describe('mapFromMdxPageToMdxListItem', () => {
	it('removes code and preserves other fields', () => {
		const page: MdxPage = {
			code: 'export default function Post() {}',
			frontmatter: { title: 'Hello', date: '2026-04-26' },
			matter: { content: 'Hi', data: {} },
			readTime: { minutes: 1, text: '1 min read', time: 60000, words: 100 },
			slug: 'blog/hello',
		}
		const result = mapFromMdxPageToMdxListItem(page)
		expect(result).not.toHaveProperty('code')
		expect(result.frontmatter).toEqual(page.frontmatter)
		expect(result.slug).toBe('blog/hello')
	})
})
