import PQueue from 'p-queue'
import { type FileSchema, inngest } from './client'
import { replaceContent } from './utils'
import { algoliaClient } from '~/utils/algolia.server'
import {
	delMdxPageGql,
	getFeaturedBlogPost,
	getMdxIndividualTagGql,
	getMdxPageGql,
	getMdxTagListGql,
	getPaginatedBlogList,
	getPaginatedTilList,
} from '~/utils/mdx-utils.server'
import { sendNtfyNotification } from '~/utils/ntfy'
import { redisClient } from '~/utils/redis.server'

// Utility functions
const P_QUEUE = new PQueue({ concurrency: 8 })

const ALGOLIA_INDEX = algoliaClient.initIndex('website')

const cachifiedOptions = {
	cachifiedOptions: { forceFresh: true },
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

		await step.run('notify-cache-started', async () => {
			await sendNtfyNotification('Cache refresh started ⌛')
		})

		if (forceFresh) {
			// Use step.invoke() instead of step.sendEvent() so this orchestrator waits
			// for child functions to finish before we mark the refresh as complete.
			// step.invoke docs: https://www.inngest.com/docs/reference/functions/step-invoke
			// step.sendEvent docs: https://www.inngest.com/docs/reference/functions/step-send-event
			await step.invoke('blog/handle-manual-refresh', {
				function: handleManualRefresh,
			})
			return { ok: true, process: 'manual-refresh-complete' }
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
			await step.invoke('blog/refresh-til-list', {
				function: refreshTilList,
			})
		}

		if (bFiles.length) {
			await step.invoke('blog/refresh-blog-files', {
				function: refreshBlogFiles,
				data: { bFiles },
			})

			await step.invoke('blog/handle-blog-list-refresh', {
				function: handleBlogListRefresh,
			})
		}

		if (pagesFiles.length) {
			await step.invoke('blog/handle-redis-pages-refresh', {
				function: handleRedisPagesRefresh,
			})
		}

		// Regardless of whether or not anything was updated, we will update the tag list.
		await step.invoke('blog/handle-tag-list-refresh', {
			function: handleTagListRefresh,
		})

		await step.run('notify-cache-finished', async () => {
			await sendNtfyNotification('Cache refresh finished! 🚀')
		})
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
		// Same orchestration rule as refreshCache: invoke waits for completion,
		// while sendEvent only guarantees enqueueing.
		await step.invoke('blog/handle-redis-pages-refresh', {
			function: handleRedisPagesRefresh,
		})

		await step.invoke('blog/handle-tag-list-refresh', {
			function: handleTagListRefresh,
		})

		const tilList = await refreshTilListInternal()
		const blogList = await refreshPaginatedBlogListInternal()

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
			content: replaceContent(String(o?.matter?.content)),
		}))

		await ALGOLIA_INDEX.replaceAllObjects([...blogObjects, ...tilObjects])

		await step.run('notify-manual-cache-finished', async () => {
			await sendNtfyNotification('Manual cache refresh finished🚀')
		})
		return { ok: true, blogObjects, tilObjects }
	},
)

export const refreshTilList = inngest.createFunction(
	{ id: 'blog/refresh-til-list' },
	{ event: 'blog/refresh-til-list' },
	async () => {
		const tilList = await refreshTilListInternal()
		const tilObjects = [...tilList].map((o) => {
			return {
				...o.matter,
				type: 'til',
				offset: o.offset,
				objectID: o.slug,
				content: replaceContent(String(o?.matter?.content)),
			}
		})

		await ALGOLIA_INDEX.saveObjects([...tilObjects])
		return { ok: true, tilObjects }
	},
)

// TODO: give this a better name
export const refreshBlogFiles = inngest.createFunction(
	{ id: 'blog/refresh-blog-files' },
	{ event: 'blog/refresh-blog-files' },
	async ({ event }) => {
		const { bFiles } = event.data

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
					await ALGOLIA_INDEX.deleteObject(slug)
				} catch {
					console.log('Slug not found in Algolia, skipping')
				}
			}
			await getMdxPageGql({ contentDir: 'blog', slug })
		}
		return { ok: true }
	},
)

/**
 * This function refreshes the individual blog pages and other pages in redis
 * TODO: give this a better name
 */
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

/**
 * This function is responsible for refreshing the blog list
 * and updated the algolia index
 */
export const handleBlogListRefresh = inngest.createFunction(
	{ id: 'blog/handle-blog-list-refresh', retries: 0 },
	{ event: 'blog/handle-blog-list-refresh' },
	async ({ step }) => {
		const blogList = await step.run('blog/refresh-blog-list', async () => {
			return await refreshPaginatedBlogListInternal()
		})

		const blogObjects = blogList.map((o) => ({
			...o?.matter,
			type: 'blog',
			objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
			content: replaceContent(String(o?.matter?.content)), // strip out the html tags from the content -- this could be better but it fits my needs
		}))
		await ALGOLIA_INDEX.saveObjects([...blogObjects])

		return { ok: true, blogObjects }
	},
)

export const handleTagListRefresh = inngest.createFunction(
	{ id: 'blog/handle-tag-list-refresh', retries: 0 },
	{ event: 'blog/handle-tag-list-refresh' },
	async ({ step }) => {
		const { tags } = await step.run('blog/refresh-tags-list', async () => {
			return await getMdxTagListGql({ ...cachifiedOptions })
		})

		for (const tag of tags) {
			await step.run('blog/refresh-single-tag', async () => {
				return await getMdxIndividualTagGql({
					userProvidedTag: tag,
					...cachifiedOptions,
				})
			})
		}
		return { ok: true }
	},
)

/**
 * Refresh each page of TIL objects in redis
 * and return the full list of TIL objects
 */
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

	// cache reset for the til list
	promises.push(
		P_QUEUE.add(() =>
			getPaginatedTilList({
				...cachifiedOptions,
				startOffset: 0,
				endOffset: Infinity,
			}),
		),
	)

	const promiseResults = await Promise.all(promises)
	const tilList = promiseResults
		.flatMap((res) => res?.fullList)
		.filter((res) => res !== undefined)

	return tilList
}

/**
 * This function scans redis for paginated blog keys and delete them
 * then it refreshes the featured blog post and paginated blog list.
 * Algolia is also updated with the new list of blog posts.
 *
 * @returns blogList: Omit<MdxPageAndSlug, "code">[]
 */
async function refreshPaginatedBlogListInternal() {
	const pattern = 'gql:blog:paginated:[0-9]*'
	let cursor = 0
	do {
		const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 200 })
		cursor = Number(reply.cursor)
		const keys = reply.keys
		if (keys.length) await redisClient.del(keys)
	} while (cursor !== 0)

	const featuredBlogPost = await getFeaturedBlogPost({ ...cachifiedOptions })
	const { pagination, posts } = await getPaginatedBlogList({
		page: 1,
		excludeFeatured: true,
		...cachifiedOptions,
	})

	const { totalPages } = pagination
	let blogList = featuredBlogPost ? [featuredBlogPost, ...posts] : posts

	if (totalPages > 1) {
		const promises = []
		for (let i = 2; i <= totalPages; i++) {
			promises.push(
				P_QUEUE.add(() =>
					getPaginatedBlogList({ ...cachifiedOptions, page: i }),
				),
			)
		}
		const otherPosts = await Promise.all(promises)
		const remainingPosts = otherPosts.flatMap((page) => page?.posts)

		blogList = [...blogList, ...remainingPosts].filter(
			(page) => page !== undefined,
		)
	}

	return blogList.filter((page) => page !== undefined)
}
