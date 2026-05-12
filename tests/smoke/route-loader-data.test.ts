import { describe, expect, it } from 'vitest'

import { type MdxPage, type MdxPageAndSlug } from '~/schemas/github'
import {
	getEffectiveTilOffset,
	isTilFromFetcher,
	isXmlPageParam,
	normalizeBlogPageParam,
} from '~/utils/route-data-helpers.server'
import {
	getBlogIndexLoaderData,
	getHomeActionData,
	getHomeLoaderData,
	getPageRouteLoaderData,
	getTilLoaderData,
} from '~/utils/route-loader-helpers.server'

const makePage = (overrides: Partial<MdxPage> = {}): MdxPage => ({
	frontmatter: { title: 'Test', ...overrides.frontmatter },
	matter: { content: '', data: {}, ...overrides.matter },
	readTime: {
		minutes: 1,
		text: '1 min',
		time: 60000,
		words: 100,
		...overrides.readTime,
	},
	slug: 'blog/test',
	...overrides,
})

const makeListItem = (
	slug: string,
	overrides: Partial<Omit<MdxPageAndSlug, 'code'>> = {},
): Omit<MdxPageAndSlug, 'code'> => ({
	frontmatter: { title: slug, date: '2026-04-26', ...overrides.frontmatter },
	matter: { content: '', data: {}, ...overrides.matter },
	readTime: {
		minutes: 1,
		text: '1 min',
		time: 60000,
		words: 100,
		...overrides.readTime,
	},
	slug,
	path: `blog/${slug}`,
	...overrides,
})

// --- route-data helpers ---

describe('normalizeBlogPageParam', () => {
	it('parses a valid page number', () => {
		expect(normalizeBlogPageParam('3')).toBe(3)
	})

	it('returns 1 for missing parameter', () => {
		expect(normalizeBlogPageParam(null)).toBe(1)
	})

	it('returns 1 for NaN values', () => {
		expect(normalizeBlogPageParam('abc')).toBe(1)
	})

	it('clamps floats to integer via parseInt', () => {
		expect(normalizeBlogPageParam('2.5')).toBe(2)
	})

	it('returns 1 for scientific notation', () => {
		expect(normalizeBlogPageParam('1e2')).toBe(1)
	})
})

describe('isTilFromFetcher', () => {
	it('detects the fromFetcher search param', () => {
		expect(
			isTilFromFetcher('https://example.com/til?fromFetcher=true&offset=3'),
		).toBe(true)
	})

	it('returns false when param is absent', () => {
		expect(isTilFromFetcher('https://example.com/til?offset=3')).toBe(false)
	})
})

describe('getEffectiveTilOffset', () => {
	it('clamps end offset to max offset', () => {
		expect(getEffectiveTilOffset(5, 3)).toBe(3)
	})

	it('returns end offset when within bounds', () => {
		expect(getEffectiveTilOffset(2, 5)).toBe(2)
	})
})

describe('isXmlPageParam', () => {
	it('detects .xml in page params', () => {
		expect(isXmlPageParam('blog/rss.xml')).toBe(true)
	})

	it('returns false for normal page params', () => {
		expect(isXmlPageParam('uses')).toBe(false)
	})
})

// --- route loader data ---

describe('getHomeLoaderData', () => {
	it('uses injected random source to produce count 1..5', async () => {
		const result = await getHomeLoaderData({
			random: () => 0.3,
			getQuote: async ({ count }) => ({ author: 'A', quote: `quote-${count}` }),
		})
		expect(result.quoteData.quote).toBe('quote-2')
		expect(result.count).toBe(2)
	})

	it('delegates to injected getQuote with the generated count', async () => {
		const calls: Array<{ count: number }> = []
		await getHomeLoaderData({
			random: () => 0.9,
			getQuote: async (args) => {
				calls.push(args)
				return { author: 'X', quote: 'y' }
			},
		})
		expect(calls).toEqual([{ count: 5 }])
	})
})

describe('getHomeActionData', () => {
	it('returns one client-side quote', async () => {
		const result = await getHomeActionData({
			getQuoteForClientSide: async () => ({ author: 'Seneca', quote: 'test' }),
		})
		expect(result).toEqual({
			quoteData: { author: 'Seneca', quote: 'test' },
			count: 1,
		})
	})

	it('falls back on error', async () => {
		const result = await getHomeActionData({
			getQuoteForClientSide: async () => {
				throw new Error('API down')
			},
		})
		expect(result.quoteData.author).toBe('Taran Bains')
		expect(result.count).toBe(1)
	})
})

describe('getBlogIndexLoaderData', () => {
	it('parses page and passes showDrafts to dependencies', async () => {
		const posts = [makeListItem('post-1'), makeListItem('post-2')]
		const result = await getBlogIndexLoaderData({
			requestUrl: 'https://example.com/blog?page=2&showDrafts',
			getFeaturedBlogPost: async () => makeListItem('featured'),
			getPaginatedBlogList: async (args) => {
				expect(args?.page).toBe(2)
				expect(args?.includeDrafts).toBe(true)
				return {
					posts,
					pagination: {
						currentPage: 2,
						totalPages: 1,
						totalPosts: 2,
						hasNextPage: false,
						hasPrevPage: true,
					},
				}
			},
		})
		expect(result.featuredPost?.slug).toBe('featured')
		expect(result.paginatedData.posts).toEqual(posts)
		expect(result.currentPage).toBe(2)
	})

	it('falls back to page 1 when param is missing', async () => {
		const result = await getBlogIndexLoaderData({
			requestUrl: 'https://example.com/blog',
			getFeaturedBlogPost: async () => null,
			getPaginatedBlogList: async () => ({
				posts: [],
				pagination: {
					currentPage: 1,
					totalPages: 0,
					totalPosts: 0,
					hasNextPage: false,
					hasPrevPage: false,
				},
			}),
		})
		expect(result.currentPage).toBe(1)
	})
})

describe('getTilLoaderData', () => {
	it('returns early for fetcher requests with only the current page', async () => {
		const result = await getTilLoaderData({
			requestUrl: 'https://example.com/til?fromFetcher=true&offset=3',
			getPaginatedTilList: async () => ({ fullList: [], maxOffset: 5 }),
		})
		expect(result).toEqual({ fullList: [], serverEndOffset: 3, maxOffset: 5 })
	})

	it('fetches all pages in parallel for initial requests', async () => {
		const callOffsets: number[] = []
		const result = await getTilLoaderData({
			requestUrl: 'https://example.com/til?offset=2',
			getPaginatedTilList: async ({ endOffset }) => {
				callOffsets.push(endOffset ?? 0)
				return { fullList: [], maxOffset: 3 }
			},
		})
		expect(result.serverEndOffset).toBe(2)
		expect(callOffsets).toHaveLength(3) // initial + 2 parallel
	})
})

describe('getPageRouteLoaderData', () => {
	it('redirects xml page params', async () => {
		await expect(
			getPageRouteLoaderData({
				pageParam: 'blog/rss.xml',
				getMdxPageGql: async () => ({
					code: '',
					frontmatter: {},
					matter: { content: '' },
				}),
			}),
		).rejects.toMatchObject({ status: 302 })
	})

	it('fetches page and marks newsletter for "now" title', async () => {
		const page = makePage({ frontmatter: { title: 'now' } })
		const result = await getPageRouteLoaderData({
			pageParam: 'now',
			getMdxPageGql: async () => page,
		})
		expect(result.showNewsletter).toBe(true)
		expect(result.page).toBe(page)
	})

	it('throws 404 when page is missing', async () => {
		await expect(
			getPageRouteLoaderData({
				pageParam: 'missing',
				getMdxPageGql: async () => null,
			}),
		).rejects.toMatchObject({ init: { status: 404 } })
	})

	it('throws 404 when dependency fails', async () => {
		await expect(
			getPageRouteLoaderData({
				pageParam: 'broken',
				getMdxPageGql: async () => {
					throw new Error('down')
				},
			}),
		).rejects.toMatchObject({ init: { status: 404 } })
	})
})
