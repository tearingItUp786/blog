import type calculateReadingTime from 'reading-time'

export type GitHubFile = { path: string; content: string }

export type GithubGraphqlObject = {
	name: string
	type?: 'blob' | string
	text?: string
	entries?: GithubGraphqlObject[]
	object: GithubGraphqlObject
}

export type MdxPage = {
	code?: string
	readTime?: ReturnType<typeof calculateReadingTime>

	frontmatter: {
		title?: string
		subtitle?: string
		description?: string
		date?: string
		tag?: string
		draft?: boolean
		hero?: string
		callOutType?: 'success' | 'warning' | 'alert' | 'info'
	}

	readTime: {
		minutes: number
		text: string
		time: number
		words: number
	}

	matter?: {
		// the content of the markdown file before processing
		content?: string
		data?: {
			title?: string
			date?: string
			tag?: string
		}
	}

	slug?: string
}

export type MdxPageAndSlug = MdxPage & {
	path?: string
}

export type TilMdxPage = MdxPageAndSlug & { offset: number }
