import cachified, {
	type CachifiedOptions,
	verboseReporter,
} from '@epic-web/cachified'

import { z } from 'zod'
import { redisCache } from './redis.server'

// Base broadcast schema for common fields
const broadcastBaseSchema = z.object({
	id: z.number(),
	created_at: z.string().datetime(),
	subject: z.string(),
})

// Schema for the list response
export const broadcastListResponseSchema = z.object({
	broadcasts: z.array(broadcastBaseSchema),
})

// Schema for a single broadcast with all details
const singleBroadcastResponseSchema = z.object({
	broadcast: z.object({
		...broadcastBaseSchema.shape,
		description: z.string().nullable(),
		content: z.string(),
		public: z.boolean(),
		published_at: z.string().datetime().nullable(),
		send_at: z.string().datetime().nullable(),
		thumbnail_alt: z.string().nullable(),
		thumbnail_url: z.string().nullable(),
		email_address: z.string().email(),
		email_layout_template: z.string(),
	}),
})

type SingleBroadcastResponse = z.infer<typeof singleBroadcastResponseSchema>
type BroadcastWithContent = SingleBroadcastResponse['broadcast']

type CommonGetProps = {
	cachifiedOptions?: Partial<Pick<CachifiedOptions<any>, 'forceFresh' | 'key'>>
}

export async function getSingleBroadcast({
	id,
	cachifiedOptions,
}: CommonGetProps & Pick<BroadcastWithContent, 'id'>) {
	return cachified(
		{
			key: `convertkit:broadcast:${id}`,
			cache: redisCache,
			ttl: 60 * 60 * 1000, // one hour of ttl
			getFreshValue: async () => {
				const params = {
					api_key: String(process.env.CONVERT_KIT_API_KEY),
				}
				const queryString = new URLSearchParams(params).toString()
				const broadcastsUrl = `${process.env.CONVERT_KIT_API}/broadcasts`

				const fullQualifiedUrl = `${broadcastsUrl}/${id}?${queryString}`
				const response = await fetch(fullQualifiedUrl, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				})

				if (!response.ok) {
					throw new Error(`Failed to fetch broadcast: ${response.statusText}`)
				}

				const data = await response.json()

				// Validate the response with Zod
				const parsedData = singleBroadcastResponseSchema.parse(data)
				return parsedData.broadcast
			},
			...cachifiedOptions,
		},
		verboseReporter(),
	)
}
