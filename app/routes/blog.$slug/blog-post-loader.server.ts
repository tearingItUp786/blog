import { data } from 'react-router'

import {
	type BlogList,
	type BlogPostListItem,
	getAdjacentBlogPosts,
	getRandomSignOffMessage,
	getVisibleBlogList,
	hasTwitterStatusUrl,
} from './blog-post-loader.helpers'
import { type MdxPage } from '~/schemas/github'
import { getMdxBlogListGraphql, getMdxPageGql } from '~/utils/mdx-utils.server'

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
