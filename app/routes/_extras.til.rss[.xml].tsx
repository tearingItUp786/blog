import { Feed } from 'feed'
import { type LoaderFunction } from 'react-router'
import { getPaginatedTilList } from '~/utils/mdx-utils.server'

export const loader: LoaderFunction = async () => {
	const blogUrl = `https://taranveerbains.ca/til`

	const { fullList, maxOffset } = await getPaginatedTilList({
		startOffset: 0,
		endOffset: Infinity,
	})

	const feed = new Feed({
		id: blogUrl,
		title: 'Taran "tearing it up" Bains Blog',
		description: 'Today Taran learned about...',
		link: blogUrl,
		language: 'en',
		updated:
			fullList.length > 0
				? new Date(fullList[0]?.frontmatter?.date ?? '')
				: new Date(),
		generator: 'https://github.com/jpmonette/feed',
		copyright: 'Taran "tearing it up" Bains',
	})

	fullList.forEach((post) => {
		const postLink = `${blogUrl}?offset=${maxOffset}#${post.slug}`
		feed.addItem({
			id: postLink,
			title: post.frontmatter.title ?? '',
			link: postLink,
			content: String(post?.matter?.content),
			date: new Date(post.frontmatter.date ?? ''),
		})
	})

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
		},
	})
}
