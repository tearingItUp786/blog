import { type FileSchema, inngest } from './client'
import { algoliaClient } from '~/utils/algolia.server'
import {
	delMdxPageGql,
	getFeaturedBlogPost,
	getMdxBlogListGraphql,
	getMdxIndividualTagGql,
	getMdxPageGql,
	getMdxTagListGql,
	getPaginatedBlogList,
	getPaginatedTilList,
} from '~/utils/mdx-utils.server'
import { redisClient } from '~/utils/redis.server'
import { sendNtfyNotification } from '~/utils/ntfy'
import PQueue from 'p-queue'

// Utility functions
const P_QUEUE = new PQueue({ concurrency: 8 })

const cachifiedOptions = {
	cachifiedOptions: { forceFresh: true },
}

function replaceContent(str = '') {
	return str
		?.replace(/(<([^>]+)>)/gi, '')
		.replace(/!\[.*?\]\(.*?\)/g, '')
		.replace(/\[(.*?)\]\(.*?\)/g, '$1')
		.replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2')
		.replace(/(\*|_)(.*?)(\*|_)/g, '$2')
		.replace(/(~~)(.*?)(~~)/g, '$2')
		.replace(/(?:\r\n|\r|\n|^)>.*(?:\r\n|\r|\n|$)/g, '')
		.replace(/(#{1,6}\s)(.*?)(\r\n|\r|\n)/g, '$2')
		.replace(/(\r\n|\r|\n)\s*(\*|-|\+|[0-9]+\.)\s/g, '')
		.replace(/(\*\*|__|\*|_|~~)/g, '')
}

/**
 * This is the primary event we're listening for and it is
 * the orchestrator for this entire refresh process.
 */
export const refreshCache = inngest.createFunction(
	{ id: 'refresh-cache', retries: 0 },
	{ event: 'blog/refresh-cache' },
	async ({ event, step }) => {
		const { contentFiles, forceFresh } = event.data

		if (!contentFiles) return { ok: false }

		if (forceFresh) {
			await step.sendEvent('blog/handle-manual-refresh', {
				name: 'blog/handle-manual-refresh',
			})
			return { ok: true, process: 'manual-refresh-triggered' }
		}

		const [bFiles, tilFiles, pagesFiles] = contentFiles.reduce(
			([blog, til, pages], file) => {
				if (file.filename.startsWith('content/blog')) blog.push(file)
				else if (file.filename.startsWith('content/til')) til.push(file)
				else if (file.filename.startsWith('content/pages')) pages.push(file)
				return [blog, til, pages]
			},
			[[], [], []] as [FileSchema[], FileSchema[], FileSchema[]],
		)

		if (tilFiles.length) {
			await step.sendEvent('blog/refresh-til-list', {
				name: 'blog/refresh-til-list',
			})
		}

		if (bFiles.length) {
			await step.sendEvent('blog/refresh-blog-files', {
				name: 'blog/refresh-blog-files',
				data: { bFiles },
			})

			await step.sendEvent('blog/handle-blog-list-refresh', {
				name: 'blog/handle-blog-list-refresh',
			})
		}

		if (pagesFiles.length) {
			await step.sendEvent('blog/handle-redis-pages-refresh', {
				name: 'blog/handle-redis-pages-refresh',
			})
		}

		// Regardless of whether or not anything was updated, we will update the tag list.
		await step.sendEvent('blog/handle-tag-list-refresh', {
			name: 'blog/handle-tag-list-refresh',
		})

		await sendNtfyNotification('Cache refresh started! 🚀')
		return { ok: true }
	},
)

/**
 * There is definitely some redundancy here between the refresh cache function and this handle manual refresh
 * but I wanted to avoid a hasty abstraction!
 *
 * I don't mind having one function just to handle the manual refresh process.
 */
export const handleManualRefresh = inngest.createFunction(
	{ id: 'blog/handle-manual-refresh', retries: 0 },
	{ event: 'blog/handle-manual-refresh' },
	async ({ step }) => {
		const algoliaIndex = algoliaClient.initIndex('website')

		await step.sendEvent('blog/handle-redis-pages-refresh', {
			name: 'blog/handle-redis-pages-refresh',
		})
		await step.sendEvent('blog/handle-blog-list-refresh', {
			name: 'blog/handle-blog-list-refresh',
		})
		await step.sendEvent('blog/handle-tag-list-refresh', {
			name: 'blog/handle-tag-list-refresh',
		})

		const tilList = await refreshTilListInternal()
		const blogList = (await getMdxBlogListGraphql({ ...cachifiedOptions }))
			.publishedPages

		const blogObjects = blogList.map((o) => ({
			...o.matter,
			type: 'blog',
			objectID: o.slug,
			content: replaceContent(String(o?.matter?.content)),
		}))

		const tilObjects = tilList.map((o) => ({
			...o.matter,
			type: 'til',
			offset: o.offset,
			objectID: o.slug,
			content: replaceContent(o.matter.content),
		}))

		await algoliaIndex.replaceAllObjects([...blogObjects, ...tilObjects])

		return { ok: true }
	},
)

export const refreshTilList = inngest.createFunction(
	{ id: 'blog/refresh-til-list' },
	{ event: 'blog/refresh-til-list' },
	async () => {
		await refreshTilListInternal()
		return { ok: true }
	},
)

// TODO: give this a better name
export const refreshBlogFiles = inngest.createFunction(
	{ id: 'blog/refresh-blog-files' },
	{ event: 'blog/refresh-blog-files' },
	async ({ event }) => {
		const { bFiles } = event.data
		const index = algoliaClient.initIndex('website')

		for (const file of bFiles) {
			const slug = file.filename
				.replace('content/blog', '')
				.replace(/\w+\.mdx?$/, '')
				.replace(/\//g, '')

			if (
				file.changeType === 'deleted' ||
				file.changeType === 'modified' ||
				file.changeType === 'moved'
			) {
				await delMdxPageGql({ contentDir: 'blog', slug })
				try {
					await index.deleteObject(slug)
				} catch {
					console.log('Slug not found in Algolia, skipping')
				}
			}
			await getMdxPageGql({ contentDir: 'blog', slug })
		}
		return { ok: true }
	},
)

// TODO: give this a better name
export const handleRedisPagesRefresh = inngest.createFunction(
	{ id: 'blog/handle-redis-pages-refresh', retries: 0 },
	{ event: 'blog/handle-redis-pages-refresh' },
	async () => {
		// this is individual blog pages that are stored in redis
		const blogKeys = await redisClient.keys('gql:blog:[0-9]*')
		// this relates to one off pages like `uses`
		const pageKeys = await redisClient.keys('gql:pages:*')

		const pageTasks = [...blogKeys, ...pageKeys].map((key) => async () => {
			const [, contentDir, slug] = key.split(':')
			if (contentDir && slug) {
				return P_QUEUE.add(() =>
					getMdxPageGql({
						contentDir,
						slug,
						...cachifiedOptions,
					}),
				)
			}
		})

		await Promise.all(pageTasks.map((task) => task()))
		return { ok: true }
	},
)

export const handleBlogListRefresh = inngest.createFunction(
	{ id: 'blog/handle-blog-list-refresh', retries: 0 },
	{ event: 'blog/handle-blog-list-refresh' },
	async () => {
		await getFeaturedBlogPost({ ...cachifiedOptions })
		await refreshPaginatedBlogListInternal()
		return { ok: true }
	},
)

export const handleTagListRefresh = inngest.createFunction(
	{ id: 'blog/handle-tag-list-refresh', retries: 0 },
	{ event: 'blog/handle-tag-list-refresh' },
	async ({ step }) => {
		const { tags } = await getMdxTagListGql({ ...cachifiedOptions })
		for (const tag of tags) {
			await step.run('blog/refresh-single-tag', async () => {
				await getMdxIndividualTagGql({
					userProvidedTag: tag,
					...cachifiedOptions,
				})
			})
		}
		return { ok: true }
	},
)

// Internal Helpers
async function refreshTilListInternal() {
	const initialData = await getPaginatedTilList({
		...cachifiedOptions,
		endOffset: Infinity,
	})
	const maxOffset = initialData.maxOffset
	const promises = []
	for (let i = 1; i <= maxOffset; i++) {
		promises.push(
			P_QUEUE.add(() =>
				getPaginatedTilList({ ...cachifiedOptions, endOffset: i }),
			),
		)
	}
	const results = await Promise.all(promises)
	return results.flatMap((res: any) => res.fullList)
}

async function refreshPaginatedBlogListInternal() {
	const pattern = 'gql:blog:paginated:[0-9]*'
	let cursor = 0
	do {
		const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 200 })
		cursor = Number(reply.cursor)
		const keys = reply.keys
		if (keys.length) await redisClient.del(keys)
	} while (cursor !== 0)

	const { pagination } = await getPaginatedBlogList({
		page: 1,
		excludeFeatured: true,
		...cachifiedOptions,
	})
	const { totalPages } = pagination
	if (totalPages > 1) {
		const promises = []
		for (let i = 2; i <= totalPages; i++) {
			promises.push(
				P_QUEUE.add(() =>
					getPaginatedBlogList({ ...cachifiedOptions, page: i }),
				),
			)
		}
		await Promise.all(promises)
	}
}
