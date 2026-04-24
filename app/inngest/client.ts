import { eventType, Inngest } from 'inngest'
import { z } from 'zod'

export const fileSchema = z.object({
	changeType: z.enum(['modified', 'added', 'deleted', 'moved']),
	filename: z.string(),
})

export type FileSchema = z.infer<typeof fileSchema>

const refreshBlogFilesDataSchema = z.object({
	bFiles: z.array(fileSchema),
})

const refreshCacheDataSchema = z.object({
	forceFresh: z.boolean(),
	contentFiles: z.array(fileSchema),
})

export const refreshBlogFilesEvent = eventType('blog/refresh-blog-files', {
	schema: refreshBlogFilesDataSchema,
})

export const refreshCacheEvent = eventType('blog/refresh-cache', {
	schema: refreshCacheDataSchema,
})

export const handleManualRefreshEvent = eventType('blog/handle-manual-refresh')

export const refreshTilListEvent = eventType('blog/refresh-til-list')

export const handleRedisPagesRefreshEvent = eventType(
	'blog/handle-redis-pages-refresh',
)

export const handleBlogListRefreshEvent = eventType(
	'blog/handle-blog-list-refresh',
)

export const handleTagListRefreshEvent = eventType(
	'blog/handle-tag-list-refresh',
)

// Create a client to send and receive events
export const inngest = new Inngest({
	id: 'taran-blog',
	eventKey: process.env.INNGEST_EVENT_KEY,
	isDev: process.env.NODE_ENV !== 'production',
})
