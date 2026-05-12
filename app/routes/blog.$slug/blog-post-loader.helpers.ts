import { type MdxPageAndSlug } from '~/schemas/github'

export type BlogPostListItem = Omit<MdxPageAndSlug, 'code'>

export type BlogList = {
	publishedPages: BlogPostListItem[]
	draftPages: BlogPostListItem[]
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
