import { EventSchemas, Inngest } from 'inngest'
import { z } from 'zod'

const fileSchema = z.object({
	changeType: z.enum(['modified', 'added', 'deleted', 'moved']),
	filename: z.string(),
})

export type FileSchema = z.infer<typeof fileSchema>

const manualRefreshEventSchema = z.object({
	name: z.literal('blog/handle-manual-refresh'),
})

const refreshTilListEventSchema = z.object({
	name: z.literal('blog/refresh-til-list'),
})

const blogListRefreshEventSchema = z.object({
	name: z.literal('blog/handle-blog-list-refresh'),
})

const refreshBlogFilesEventSchema = z.object({
	name: z.literal('blog/refresh-blog-files'),
	data: z.object({
		bFiles: z.array(fileSchema),
	}),
})

const refreshRedisPagesEventSchema = z.object({
	name: z.literal('blog/handle-redis-pages-refresh'),
})

const tagListRefreshEventSchema = z.object({
	name: z.literal('blog/handle-tag-list-refresh'),
})

const refreshCacheEventSchema = z.object({
	name: z.literal('blog/refresh-cache'),
	data: z.object({
		forceFresh: z.boolean(),
		contentFiles: z.array(fileSchema),
	}),
})

// Create a client to send and receive events
export const inngest = new Inngest({
	id: 'taran-blog',
	eventKey: process.env.INNGEST_EVENT_KEY,
	schemas: new EventSchemas().fromZod([
		refreshBlogFilesEventSchema,
		manualRefreshEventSchema,
		refreshCacheEventSchema,
		refreshTilListEventSchema,
		refreshRedisPagesEventSchema,
		blogListRefreshEventSchema,
		tagListRefreshEventSchema,
	]),
})
