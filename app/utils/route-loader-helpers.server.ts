import { data, redirect } from 'react-router'
import {
	getEffectiveTilOffset,
	isTilFromFetcher,
	isXmlPageParam,
	normalizeBlogPageParam,
} from './route-data-helpers.server'
import {
	type MdxPage,
	type MdxPageAndSlug,
	type TilMdxPage,
} from '~/schemas/github'

type QuoteResult = { author: string; quote: string }

export async function getHomeLoaderData({
	random = Math.random,
	getQuote,
}: {
	random?: () => number
	getQuote: (args: { count: number }) => Promise<QuoteResult>
}) {
	const count = Math.floor(random() * 5) + 1
	const quoteData = await getQuote({ count })
	return { quoteData, count }
}

export async function getHomeActionData({
	getQuoteForClientSide,
}: {
	getQuoteForClientSide: () => Promise<QuoteResult>
}) {
	try {
		const quoteData = await getQuoteForClientSide()
		return { quoteData, count: 1 }
	} catch {
		return {
			quoteData: {
				author: 'Taran Bains',
				quote:
					"Sometimes stuff breaks, and that's okay. Including my quotes API 😅",
			},
			count: 1,
		}
	}
}

export async function getBlogIndexLoaderData({
	requestUrl,
	getFeaturedBlogPost,
	getPaginatedBlogList,
}: {
	requestUrl: string
	getFeaturedBlogPost: (args: {
		includeDrafts: boolean
	}) => Promise<Omit<MdxPageAndSlug, 'code'> | null>
	getPaginatedBlogList: (args: {
		page: number
		perPage: number
		includeDrafts: boolean
		excludeFeatured: boolean
	}) => Promise<{
		posts: Array<Omit<MdxPageAndSlug, 'code'>>
		pagination: {
			currentPage: number
			totalPages: number
			totalPosts: number
			hasNextPage: boolean
			hasPrevPage: boolean
		}
	}>
}) {
	const url = new URL(requestUrl)
	const showDrafts = url.searchParams.has('showDrafts')
	const page = normalizeBlogPageParam(url.searchParams.get('page'))

	const featuredPost = await getFeaturedBlogPost({ includeDrafts: showDrafts })
	const paginatedData = await getPaginatedBlogList({
		page,
		perPage: 9,
		includeDrafts: showDrafts,
		excludeFeatured: true,
	})

	return { featuredPost, paginatedData, currentPage: page }
}

export async function getTilLoaderData({
	requestUrl,
	getPaginatedTilList,
}: {
	requestUrl: string
	getPaginatedTilList: (args: {
		endOffset?: number
	}) => Promise<{ fullList: TilMdxPage[]; maxOffset: number }>
}) {
	const url = new URL(requestUrl)
	const endOffsetParam = url.searchParams.get('offset')
	const endOffset = Number(endOffsetParam) || 1

	const initialData = await getPaginatedTilList({ endOffset })
	let maxOffset = initialData.maxOffset
	const effectiveEndOffset = getEffectiveTilOffset(endOffset, maxOffset)

	if (isTilFromFetcher(requestUrl)) {
		return {
			fullList: initialData.fullList,
			serverEndOffset: effectiveEndOffset,
			maxOffset,
		}
	}

	const promises = Array.from({ length: effectiveEndOffset }, (_, i) =>
		getPaginatedTilList({ endOffset: i + 1 }),
	)

	const fullList: Array<TilMdxPage> = (await Promise.all(promises)).flatMap(
		(value) => {
			maxOffset = value.maxOffset
			return value.fullList
		},
	)

	return {
		fullList,
		serverEndOffset: effectiveEndOffset,
		maxOffset,
	}
}

export async function getPageRouteLoaderData({
	pageParam,
	getMdxPageGql,
}: {
	pageParam: string
	getMdxPageGql: (args: {
		contentDir: string
		slug: string
	}) => Promise<MdxPage | null | void>
}) {
	if (isXmlPageParam(pageParam)) {
		throw redirect('/blog/rss.xml')
	}

	try {
		const page = await getMdxPageGql({
			contentDir: 'pages',
			slug: pageParam,
		})

		if (!page) {
			throw data({ error: pageParam }, { status: 404 })
		}

		const showNewsletter =
			String(page?.frontmatter?.title).toLowerCase() === 'now'
		return { page, showNewsletter }
	} catch {
		throw data({ error: pageParam }, { status: 404 })
	}
}
