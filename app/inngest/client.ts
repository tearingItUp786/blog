import { EventSchemas, Inngest } from 'inngest'
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

type BlogNoDataEventSchemas = {
	'blog/handle-manual-refresh': {}
	'blog/refresh-til-list': {}
	'blog/handle-redis-pages-refresh': {}
	'blog/handle-blog-list-refresh': {}
	'blog/handle-tag-list-refresh': {}
}

// Create a client to send and receive events
export const inngest = new Inngest({
	id: 'taran-blog',
	eventKey: process.env.INNGEST_EVENT_KEY,
	schemas: new EventSchemas()
		.fromSchema({
			'blog/refresh-blog-files': refreshBlogFilesDataSchema,
			'blog/refresh-cache': refreshCacheDataSchema,
		})
		.fromRecord<BlogNoDataEventSchemas>(),
})
