import { Feed } from 'feed'
import { type LoaderFunction } from 'react-router'
import {
	broadcastListResponseSchema,
	getSingleBroadcast,
} from '~/utils/convertkit.server'

// Helper function to convert title to slug format
function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/[^\w\-]+/g, '') // Remove non-word chars (except hyphens)
		.replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
		.replace(/^-+/, '') // Trim hyphens from start
		.replace(/-+$/, '') // Trim hyphens from end
}

export const loader: LoaderFunction = async () => {
	const params = {
		api_key: String(process.env.CONVERT_KIT_API_KEY),
		sort_order: 'desc',
	}

	const queryString = new URLSearchParams(params).toString()
	const broadcastsUrl = `${process.env.CONVERT_KIT_API}/broadcasts?${queryString}`

	const response = await fetch(broadcastsUrl, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch broadcasts: ${response.statusText}`)
	}

	const data = await response.json()
	const parsedData = broadcastListResponseSchema.parse(data)
	const { broadcasts } = parsedData

	try {
		// Fetch detailed content for each broadcast
		const broadcastPromises = broadcasts.map((broadcast) =>
			getSingleBroadcast({ id: broadcast.id }),
		)
		const broadcastsWithContent = await Promise.all(broadcastPromises)

		// Create RSS feed
		const newsletterUrl = `https://taranveerbains.kit.com/posts`

		const feed = new Feed({
			id: newsletterUrl,
			title: 'Taran Bains Newsletter',
			description: 'Latest updates from Taran Bains',
			link: newsletterUrl,
			language: 'en',
			updated:
				broadcastsWithContent.length > 0
					? new Date(
							broadcastsWithContent[0].published_at ||
								broadcastsWithContent[0].created_at,
						)
					: new Date(),
			generator: 'https://github.com/jpmonette/feed',
			copyright: 'Taran Bains',
		})

		// Add each newsletter broadcast as an item in the feed
		broadcastsWithContent.forEach((broadcast) => {
			if (broadcast.public) {
				const postLink = `${newsletterUrl}/${slugify(broadcast.subject)}`
				feed.addItem({
					id: postLink,
					title: broadcast.subject,
					link: postLink,
					date: new Date(broadcast.published_at || broadcast.created_at),
					description: broadcast.description ?? '',
					content: broadcast.content,
					image: broadcast.thumbnail_url || undefined,
				})
			}
		})

		return new Response(feed.rss2(), {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control':
					'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400',
			},
		})
	} catch (error) {
		console.error('Error generating newsletter RSS feed:', error)
		return new Response('Error generating feed', { status: 500 })
	}
}
