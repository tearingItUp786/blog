import { Feed } from 'feed'
import { type LoaderFunction } from 'react-router'
import { getMdxBlogListGraphql } from '~/utils/mdx-utils.server'

export const loader: LoaderFunction = async () => {
	const blogUrl = `https://taranveerbains.com/blog`
	const { publishedPages } = await getMdxBlogListGraphql()

	const feed = new Feed({
		id: blogUrl,
		title: 'Taran "tearing it up" Bains Blog',
		description: 'Thoughts about web development and life',
		link: blogUrl,
		language: 'en',
		updated:
			publishedPages.length > 0
				? new Date(publishedPages[0]?.frontmatter?.date ?? '')
				: new Date(),
		generator: 'https://github.com/jpmonette/feed',
		copyright: 'Taran "tearing it up" Bains',
	})

	publishedPages.forEach((post) => {
		const postLink = `${blogUrl}/${post.slug}`
		feed.addItem({
			id: postLink,
			title: post.frontmatter.title ?? '',
			link: postLink,
			date: new Date(post.frontmatter.date ?? ''),
			description:
				post.frontmatter.description ?? post.frontmatter.subtitle ?? '',
		})
	})

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
		},
	})
}
