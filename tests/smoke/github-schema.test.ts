import { describe, expect, it } from 'vitest'

import * as githubSchemas from '~/schemas/github'
import {
	GithubDownloadDirResponseSchema,
	MdxPageSchema,
} from '~/schemas/github'

describe('github schemas', () => {
	it('keeps internal runtime schemas out of the public module surface', () => {
		expect(githubSchemas).not.toHaveProperty('GitHubFileSchema')
		expect(githubSchemas).not.toHaveProperty('GithubGraphqlObjectSchema')
		expect(githubSchemas).not.toHaveProperty('ReadTimeSchema')
		expect(githubSchemas).not.toHaveProperty('MdxPageAndSlugSchema')
		expect(githubSchemas).not.toHaveProperty('TilMdxPageSchema')
	})

	it('parses recursive GitHub directory responses', () => {
		const parsed = GithubDownloadDirResponseSchema.parse({
			repository: {
				object: {
					entries: [
						{
							name: 'post',
							type: 'tree',
							object: {
								text: null,
								entries: [
									{
										name: 'index.mdx',
										type: 'blob',
										object: { text: '# Hello' },
									},
								],
							},
						},
					],
				},
			},
		})

		expect(
			parsed.repository.object?.entries?.[0]?.object.entries?.[0]?.name,
		).toBe('index.mdx')
	})

	it('normalizes nullable MDX fields without changing public parsing behavior', () => {
		const parsed = MdxPageSchema.parse({
			code: 'export default function Post() {}',
			readTime: {
				minutes: 1,
				text: '1 min read',
				time: 60_000,
				words: 100,
			},
			frontmatter: {
				title: null,
				date: new Date('2026-04-26T12:00:00.000Z'),
				draft: null,
			},
			matter: null,
			slug: null,
		})

		expect(parsed.frontmatter.title).toBeUndefined()
		expect(parsed.frontmatter.date).toBe('2026-04-26')
		expect(parsed.frontmatter.draft).toBeUndefined()
		expect(parsed.matter).toBeUndefined()
		expect(parsed.slug).toBeUndefined()
	})
})
