import cachified, { verboseReporter } from '@epic-web/cachified'
import { Feed } from 'feed'
import { type LoaderFunction } from 'react-router'
import sanitizeHtml from 'sanitize-html'
import {
	broadcastListResponseSchema,
	getSingleBroadcast,
} from '~/utils/convertkit.server'
import { redisCache } from '~/utils/redis.server'

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

async function generateNewsletterRss() {
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
			// Sanitize HTML content to remove style tags and attributes
			const sanitizedContent = sanitizeHtml(broadcast.content, {
				allowedTags: sanitizeHtml.defaults.allowedTags,
				allowedAttributes: {
					...sanitizeHtml.defaults.allowedAttributes,
				},
			})

			feed.addItem({
				id: postLink,
				title: broadcast.subject,
				link: postLink,
				date: new Date(broadcast.published_at || broadcast.created_at),
				description: broadcast.description ?? '',
				content: sanitizedContent,
				image: broadcast.thumbnail_url || undefined,
			})
		}
	})

	return feed.rss2()
}

export const loader: LoaderFunction = async () => {
	try {
		const xml = await cachified(
			{
				key: 'convertkit:newsletter:rss:v1',
				cache: redisCache,
				ttl: 60 * 60 * 1000,
				getFreshValue: generateNewsletterRss,
			},
			verboseReporter(),
		)

		return new Response(xml, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=300, s-maxage=300',
			},
		})
	} catch (error) {
		console.error('Error generating newsletter RSS feed:', error)
		return new Response('Error generating feed', { status: 500 })
	}
}
