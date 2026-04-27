import { describe, expect, it } from 'vitest'

import {
	getAdjacentBlogPosts,
	getBlogPostLoaderData,
	getRandomSignOffMessage,
	getVisibleBlogList,
	hasTwitterStatusUrl,
} from '~/routes/blog.$slug/blog-post-loader.server'
import { type MdxPage, type MdxPageAndSlug } from '~/schemas/github'

const makePage = (overrides: Partial<MdxPage> = {}): MdxPage => ({
	frontmatter: {
		title: 'Current post',
		description: 'A post',
		date: '2026-04-26',
		...overrides.frontmatter,
	},
	matter: {
		content: 'Hello world',
		data: {},
		...overrides.matter,
	},
	readTime: {
		minutes: 1,
		text: '1 min read',
		time: 60_000,
		words: 100,
		...overrides.readTime,
	},
	slug: 'blog/current-post',
	...overrides,
})

const makeListItem = (
	slug: string,
	overrides: Partial<Omit<MdxPageAndSlug, 'code'>> = {},
): Omit<MdxPageAndSlug, 'code'> => ({
	frontmatter: {
		title: slug,
		date: '2026-04-26',
		...overrides.frontmatter,
	},
	matter: {
		content: '',
		data: {},
		...overrides.matter,
	},
	readTime: {
		minutes: 1,
		text: '1 min read',
		time: 60_000,
		words: 100,
		...overrides.readTime,
	},
	slug,
	path: `blog/${slug}`,
	...overrides,
})

describe('blog post loader helpers', () => {
	it('detects Twitter status URLs in MDX content', () => {
		expect(
			hasTwitterStatusUrl(
				'Read https://twitter.com/tearingItUp786/status/1234567890 today.',
			),
		).toBe(true)
		expect(hasTwitterStatusUrl('Read https://twitter.com/tearingItUp786')).toBe(
			false,
		)
	})

	it('hides drafts in production unless drafts are requested', () => {
		const publishedPages = [makeListItem('published')]
		const draftPages = [makeListItem('draft', { frontmatter: { draft: true } })]

		expect(
			getVisibleBlogList({
				publishedPages,
				draftPages,
				isProduction: true,
				showDrafts: false,
			}),
		).toEqual(publishedPages)
		expect(
			getVisibleBlogList({
				publishedPages,
				draftPages,
				isProduction: true,
				showDrafts: true,
			}),
		).toEqual([...draftPages, ...publishedPages])
	})

	it('finds adjacent posts by slug instead of duplicate titles', () => {
		const previous = makeListItem('previous-post', {
			frontmatter: { title: 'Same title' },
		})
		const current = makeListItem('current-post', {
			frontmatter: { title: 'Same title' },
		})
		const next = makeListItem('next-post', {
			frontmatter: { title: 'Same title' },
		})

		expect(
			getAdjacentBlogPosts({
				blogList: [previous, current, next],
				currentSlug: 'current-post',
			}),
		).toEqual({ previous, next })
	})

	it('selects signoff messages from an injectable random source', () => {
		expect(getRandomSignOffMessage(() => 0)).toBe(
			'Appreciate you reading this.',
		)
		expect(getRandomSignOffMessage(() => 0.99)).toBe(
			'Thanks for reading. Go build something cool.',
		)
	})

	it('builds loader data from injected content dependencies', async () => {
		const page = makePage({
			matter: {
				content:
					'Embedded https://twitter.com/tearingItUp786/status/1234567890',
				data: {},
			},
		})
		const previous = makeListItem('previous-post')
		const current = makeListItem('current-post')
		const next = makeListItem('next-post')

		const result = await getBlogPostLoaderData({
			slug: 'current-post',
			requestUrl: 'https://example.com/blog/current-post?showDrafts=true',
			cspNonce: 'nonce-value',
			isProduction: true,
			getPage: async () => page,
			getBlogList: async () => ({
				publishedPages: [previous, current, next],
				draftPages: [],
			}),
			getSignOffMessage: () => 'Thanks for testing.',
		})

		expect(result).toMatchObject({
			nonce: 'nonce-value',
			page,
			prev: previous,
			next,
			reqUrl: 'https://example.com/blog/current-post',
			hasTwitterEmbed: true,
			signOffMessage: 'Thanks for testing.',
		})
	})

	it('throws 404 responses for missing blog posts', async () => {
		await expect(
			getBlogPostLoaderData({
				slug: 'missing-post',
				requestUrl: 'https://example.com/blog/missing-post',
				cspNonce: 'nonce-value',
				getPage: async () => null,
				getBlogList: async () => ({ publishedPages: [], draftPages: [] }),
			}),
		).rejects.toMatchObject({ init: { status: 404 } })
	})

	it('throws 404 responses for production drafts unless drafts are requested', async () => {
		const draftPage = makePage({ frontmatter: { draft: true } })

		await expect(
			getBlogPostLoaderData({
				slug: 'draft-post',
				requestUrl: 'https://example.com/blog/draft-post',
				cspNonce: 'nonce-value',
				isProduction: true,
				getPage: async () => draftPage,
				getBlogList: async () => ({ publishedPages: [], draftPages: [] }),
			}),
		).rejects.toMatchObject({ init: { status: 404 } })

		await expect(
			getBlogPostLoaderData({
				slug: 'draft-post',
				requestUrl: 'https://example.com/blog/draft-post?showDrafts=true',
				cspNonce: 'nonce-value',
				isProduction: true,
				getPage: async () => draftPage,
				getBlogList: async () => ({ publishedPages: [], draftPages: [] }),
			}),
		).resolves.toMatchObject({ page: draftPage })
	})

	it('rethrows unexpected content dependency failures', async () => {
		const dependencyError = new Error('Redis exploded')

		await expect(
			getBlogPostLoaderData({
				slug: 'current-post',
				requestUrl: 'https://example.com/blog/current-post',
				cspNonce: 'nonce-value',
				getPage: async () => {
					throw dependencyError
				},
				getBlogList: async () => ({ publishedPages: [], draftPages: [] }),
			}),
		).rejects.toBe(dependencyError)
	})
})
