import { data } from 'react-router'

import { type MdxPage, type MdxPageAndSlug } from '~/schemas/github'
import { getMdxBlogListGraphql, getMdxPageGql } from '~/utils/mdx-utils.server'

type BlogPostListItem = Omit<MdxPageAndSlug, 'code'>

type BlogList = {
	publishedPages: BlogPostListItem[]
	draftPages: BlogPostListItem[]
}

type BlogPostLoaderDependencies = {
	getPage?: (args: { slug: string }) => Promise<MdxPage | null | void>
	getBlogList?: () => Promise<BlogList>
	getSignOffMessage?: () => string
}

export type BlogPostLoaderData = {
	nonce: string
	page: MdxPage
	reqUrl: string
	next?: BlogPostListItem
	prev?: BlogPostListItem
	hasTwitterEmbed: boolean
	signOffMessage: string
}

const SIGN_OFF_MESSAGES = [
	'Appreciate you reading this.',
	'Thanks for sticking around to the end.',
	'Thanks for hanging out.',
	'Grateful you spent some time here.',
	'Hope this was worth your time.',
	'Thanks for reading. Go build something cool.',
] as const

const TWITTER_STATUS_REGEX =
	/https:\/\/twitter\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/i

export function hasTwitterStatusUrl(content?: string | null) {
	return TWITTER_STATUS_REGEX.test(content ?? '')
}

export function getRandomSignOffMessage(random = Math.random) {
	const index = Math.min(
		Math.floor(random() * SIGN_OFF_MESSAGES.length),
		SIGN_OFF_MESSAGES.length - 1,
	)
	return SIGN_OFF_MESSAGES[index]
}

export function getVisibleBlogList({
	publishedPages,
	draftPages,
	isProduction,
	showDrafts,
}: BlogList & {
	isProduction: boolean
	showDrafts: boolean
}) {
	return isProduction && !showDrafts
		? publishedPages
		: [...draftPages, ...publishedPages]
}

function normalizeBlogSlug(value?: string) {
	return value
		?.replace(/^\/?blog\//, '')
		.replace(/^\//, '')
		.replace(/\/$/, '')
}

function blogPostMatchesSlug(post: BlogPostListItem, currentSlug: string) {
	const normalizedCurrentSlug = normalizeBlogSlug(currentSlug)
	return [post.slug, post.path].some(
		(value) => normalizeBlogSlug(value) === normalizedCurrentSlug,
	)
}

export function getAdjacentBlogPosts({
	blogList,
	currentSlug,
}: {
	blogList: BlogPostListItem[]
	currentSlug: string
}) {
	const currentIndex = blogList.findIndex((post) =>
		blogPostMatchesSlug(post, currentSlug),
	)

	return {
		previous: blogList[currentIndex - 1],
		next: blogList[currentIndex + 1],
	}
}

function isHiddenProductionDraft({
	page,
	isProduction,
	showDrafts,
}: {
	page: MdxPage
	isProduction: boolean
	showDrafts: boolean
}) {
	return page.frontmatter.draft && isProduction && !showDrafts
}

function throwBlogPostNotFound(slug: string): never {
	throw data({ error: slug, data: { page: null } }, { status: 404 })
}

export async function getBlogPostLoaderData({
	slug,
	requestUrl,
	cspNonce,
	isProduction = process.env.NODE_ENV === 'production',
	getPage = ({ slug }) => getMdxPageGql({ contentDir: 'blog', slug }),
	getBlogList = () => getMdxBlogListGraphql(),
	getSignOffMessage = getRandomSignOffMessage,
}: {
	slug: string
	requestUrl: string
	cspNonce: string
	isProduction?: boolean
} & BlogPostLoaderDependencies): Promise<BlogPostLoaderData> {
	const urlReq = new URL(requestUrl)
	const showDrafts = urlReq.searchParams.has('showDrafts')
	const page = await getPage({ slug })

	if (!page) {
		throwBlogPostNotFound(slug)
	}

	if (isHiddenProductionDraft({ page, isProduction, showDrafts })) {
		throwBlogPostNotFound(slug)
	}

	const { publishedPages, draftPages } = await getBlogList()
	const blogList = getVisibleBlogList({
		publishedPages,
		draftPages,
		isProduction,
		showDrafts,
	})
	const { previous, next } = getAdjacentBlogPosts({
		blogList,
		currentSlug: slug,
	})

	return {
		nonce: cspNonce,
		page,
		prev: previous,
		next,
		reqUrl: urlReq.origin + urlReq.pathname,
		hasTwitterEmbed: hasTwitterStatusUrl(page.matter?.content),
		signOffMessage: getSignOffMessage(),
	}
}
