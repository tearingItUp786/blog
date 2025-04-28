import { inngest } from './client'
import PQueue from 'p-queue'
import { type MdxPage, type TilMdxPage } from 'types'
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
import { sendNtfyNotification } from '~/utils/ntfy'
import { redisClient } from '~/utils/redis.server'

type File = {
	changeType: 'modified' | 'added' | 'deleted' | 'moved'
	filename: string
}

const cachifiedOptions = {
	cachifiedOptions: { forceFresh: true },
}

function replaceContent(str = '') {
	return str
		?.replace(/(<([^>]+)>)/gi, '') // Remove HTML tags
		.replace(/!\[.*?\]\(.*?\)/g, '') // Remove images ![alt text](URL)
		.replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert links [text](URL) to 'text'
		.replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2') // Bold **text** or __text__
		.replace(/(\*|_)(.*?)(\*|_)/g, '$2') // Italic *text* or _text_
		.replace(/(~~)(.*?)(~~)/g, '$2') // Strikethrough ~~text~~
		.replace(/(?:\r\n|\r|\n|^)>.*(?:\r\n|\r|\n|$)/g, '') // Blockquotes >
		.replace(/(#{1,6}\s)(.*?)(\r\n|\r|\n)/g, '$2') // Headers #
		.replace(/(\r\n|\r|\n)\s*(\*|-|\+|[0-9]+\.)\s/g, '') // Lists - or * or + or 1.
		.replace(/(\*\*|__|\*|_|~~)/g, '') // Cleanup leftover Markdown symbols
}

const getFileArray = (acc: [File[], File[], File[]], file: File) => {
	if (file.filename.startsWith('content/blog')) {
		acc[0].push(file)
	} else if (file.filename.startsWith('content/til')) {
		acc[1].push(file)
	} else if (file.filename.startsWith('content/pages')) {
		acc[2].push(file)
	}
	return acc
}

/**
 * We don't want to overload our server with all these pending promises
 * So let's use a queue to queue up what needs to be fetched.
 */
const P_QUEUE = new PQueue({ concurrency: 8 })

/**
 * The purpose of this function is to refresh the paginated blog list
 * It also allows us to delete the old keys that might be lingering
 */
const refreshPaginatedBlogList = async () => {
	console.log('🔍 Refreshing paginated blog list')
	try {
		// Delete existing paginated blog keys
		const pattern = 'gql:blog:paginated:[0-9]*'
		let cursor = 0

		do {
			const reply = await redisClient.scan(cursor, {
				MATCH: pattern,
				COUNT: 200,
			})

			cursor = Number(reply.cursor)
			const keys = reply.keys

			if (keys.length > 0) {
				console.log(`🗑️ Deleting ${keys.length} paginated blog keys`)
				await redisClient.del(keys)
			}
		} while (cursor !== 0)

		// Get first page to determine total pages
		console.log('📄 Fetching first page to determine pagination')
		const { pagination } = await getPaginatedBlogList({
			page: 1,
			excludeFeatured: true,
			...cachifiedOptions,
		})

		const { totalPages } = pagination
		console.log(`📚 Found ${totalPages} total pages to refresh`)

		// Create an array of promises for pages 2 to totalPages
		if (totalPages > 1) {
			const pagePromises = []

			for (let i = 2; i <= totalPages; i++) {
				const promiseFunc = () =>
					getPaginatedBlogList({ ...cachifiedOptions, page: i })

				pagePromises.push(
					P_QUEUE.add(promiseFunc) as ReturnType<typeof getPaginatedBlogList>,
				)
			}

			// Wait for all pages to be refreshed in parallel (respecting the queue concurrency)
			await Promise.all(pagePromises)
			console.log(`✅ Successfully refreshed all ${totalPages} blog pages`)
		}

		return { totalPages }
	} catch (error) {
		console.error('❌ Error refreshing paginated blog list:', error)
		throw error
	}
}

const refreshTilList = async () => {
	console.log('🔍 Refreshing TIL list')
	try {
		// Get initial data to determine maxOffset
		const initialData = await getPaginatedTilList({
			...cachifiedOptions,
			endOffset: Infinity,
		})

		const maxOffset = initialData.maxOffset
		console.log(`📚 Found ${maxOffset} total offsets to refresh`)

		if (maxOffset <= 0) {
			console.log('⚠️ No TIL entries found to refresh')
			return []
		}

		// Create an array of promises for all offsets
		const promises: ReturnType<typeof getPaginatedTilList>[] = []

		for (let i = 1; i <= maxOffset; i++) {
			const promiseFunc = () =>
				getPaginatedTilList({ ...cachifiedOptions, endOffset: i })

			promises.push(
				P_QUEUE.add(promiseFunc) as ReturnType<typeof getPaginatedTilList>,
			)
		}

		// Process all promises and collect results
		console.log(`⏳ Processing ${promises.length} TIL pagination requests...`)
		const results = await Promise.all(promises)

		// Efficiently combine all results
		let tilList: TilMdxPage[] = []
		results.forEach((result, index) => {
			console.log(`✅ Processed TIL offset ${index + 1}/${maxOffset}`)
			tilList = tilList.concat(result.fullList)
		})

		console.log(`🔄 Refreshing TIL XML sitemap`)
		await getPaginatedTilList({
			...cachifiedOptions,
			startOffset: 0,
			endOffset: Infinity,
		})

		console.log(`✅ Successfully refreshed all ${tilList.length} TIL entries`)
		return tilList
	} catch (error) {
		console.error('❌ Error refreshing TIL list:', error)
		throw error
	}
}

export const refreshCache = inngest.createFunction(
	{
		id: 'refresh-cache',
		retries: 0,
		onFailure: async ({ event }) => {
			await sendNtfyNotification(
				`Failure to refresh cache: ${event.data.event}`,
			)
		},
	},
	{ event: 'blog/refresh-cache' },
	async ({ event, step }) => {
		const index = algoliaClient?.initIndex('website')

		const { contentFiles } = event.data

		if (!contentFiles) {
			return { ok: false }
		}

		// refresh til list, blog list, all blog articles, tag list, and  tags
		const { forceFresh } = event.data
		if (forceFresh) {
			await step.sendEvent('blog/handle-manual-refresh', {
				name: 'blog/handle-manual-refresh',
				data: { forceFresh },
			})

			return { ok: true, process: 'manual-refresh-triggered' }
		}

		/**
		 * Actual meat and potatoes of refreshing
		 */
		const [bFiles, tilFiles, pagesFiles] = contentFiles.reduce(getFileArray, [
			[],
			[],
			[],
		])

		let blogList: Omit<MdxPage, 'code'>[] = []
		let tilList: TilMdxPage[] = []

		// if we edited a content file, call the fetcher function for getContent
		if (tilFiles.length) {
			console.log('👍 refreshing til list')
			tilList = await refreshTilList()
		}

		// we want to delete and refresh the individual files
		// before we go and refresh the list
		for (const file of bFiles) {
			// refresh the cache in this case
			const slug = file.filename
				.replace('content/blog', '')
				.replace(/\w+\.mdx?$/, '')
				.replace(/\//g, '')

			const args = {
				contentDir: 'blog',
				slug,
				...cachifiedOptions,
			}

			if (
				file.changeType === 'deleted' ||
				file.changeType === 'modified' ||
				file.changeType === 'moved'
			) {
				console.log('❌ delete', slug, 'from redis and algolia')
				await delMdxPageGql(args)

				try {
					const recordToDelete = await index.getObject(`${slug}`)

					if (recordToDelete) {
						await index.deleteObject(slug)
					}
				} catch (err) {
					console.log('😕 does not exist in algolia', slug)
					continue
				}
			}

			console.log('👍 refresh ', slug, 'from redis')
			await getMdxPageGql(args)
		}

		// do it for the blog list if we need to as well
		if (bFiles.length) {
			console.log('👍 refreshing published blog list')

			await step.sendEvent('send-refresh-blog-list', {
				name: 'blog/handle-blog-list-refresh',
				data: {},
			})

			const { publishedPages } = await getMdxBlogListGraphql({
				...cachifiedOptions,
			})
			blogList = publishedPages
		}

		if (pagesFiles.length) {
			console.log('👍 refresh pages in redis')

			await step.sendEvent('send-refresh-pages-event', {
				name: 'blog/handle-redis-pages-refresh',
				data: {},
			})
		}

		await step.sendEvent('send-refresh-tag-event', {
			name: 'blog/handle-tag-list-refresh',
			data: { userId: event.data.userId },
		})

		if (blogList.length || tilList.length) {
			const blogObjects = [...blogList].map((o) => ({
				...o.matter,
				type: 'blog',
				objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
				content: replaceContent(o?.matter?.content), // strip out the html tags from the content -- this could be better but it fits my needs
			}))

			const tilObjects = [...tilList].map((o) => {
				return {
					...o.matter,
					type: 'til',
					offset: o.offset,
					objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
					content: replaceContent(o?.matter?.content),
				}
			})

			await index.saveObjects([...blogObjects, ...tilObjects])
		}

		console.log('👍 refreshed algolia index with til list')
		// refresh all the redis tags as well
		await sendNtfyNotification('Cache refreshed successfully!')

		return { ok: true }
	},
)

export const handleRedisPagesRefresh = inngest.createFunction(
	{
		id: 'blog/handle-redis-pages-refresh',
		retries: 0,
	},
	{
		event: 'blog/handle-redis-pages-refresh',
	},
	async ({}) => {
		// if redis doesn't have keys already, then we're outta luck here
		// we need redis to have the keys to know what to refresh
		const individualBlogArticles = await redisClient.keys('gql:blog:[0-9]*')
		const individualPages = await redisClient.keys('gql:pages:*')

		// Execute all tasks
		const pageTasks = [...individualBlogArticles, ...individualPages].map(
			(article) => async () => {
				const [, contentDir, slug] = article.split(':')
				if (contentDir && slug) {
					return P_QUEUE.add(() =>
						getMdxPageGql({
							contentDir,
							slug,
							...cachifiedOptions,
						}),
					)
				}
			},
		)
		await Promise.all(pageTasks.map((task) => task()))
		return {
			ok: true,
		}
	},
)

export const handleBlogListRefresh = inngest.createFunction(
	{
		id: 'blog/handle-blog-list-refresh',
		retries: 0,
	},
	{
		event: 'blog/handle-blog-list-refresh',
	},
	async ({}) => {
		console.log('👍 refreshing featured blog post')
		await getFeaturedBlogPost({
			...cachifiedOptions,
		})

		console.log('👍 refreshing paginated blog list')
		await refreshPaginatedBlogList()

		return {
			ok: true,
		}
	},
)

export const handleTagListRefresh = inngest.createFunction(
	{
		id: 'blog/handle-tag-list-refresh',
		retries: 0,
		onFailure: async ({ error }) => {
			await sendNtfyNotification(
				`Failed to handle tag list refresh: ${error.message}`,
			)
		},
	},
	{ event: 'blog/handle-tag-list-refresh' },
	async ({}) => {
		console.log('👍 refresh tag list in redis')
		const { tags } = await getMdxTagListGql({ ...cachifiedOptions })
		console.log('👍 refresh the individual tags in redis')

		// Map your tags to functions that add tasks to the queue
		const tasks = tags.map((tag) => async () => {
			return P_QUEUE.add(() =>
				getMdxIndividualTagGql({
					userProvidedTag: tag,
					...cachifiedOptions,
				}),
			)
		})

		// Execute all tasks
		await Promise.all(tasks.map((task) => task()))
		return {
			ok: true,
			tags,
		}
	},
)

export const manualRefreshFunction = inngest.createFunction(
	{
		id: 'blog/handle-manual-refresh',
		retries: 0,
		onFailure: async ({ error }) => {
			await sendNtfyNotification(
				`Failed to handle manual refresh: ${error.message}`,
			)
		},
	},
	{
		event: 'blog/handle-manual-refresh',
	},

	async ({ event, step }) => {
		console.log('🔥 Manually force fresh invoked!')
		const algoliaIndex = algoliaClient?.initIndex('website')

		await step.sendEvent('send-refresh-pages-event', {
			name: 'blog/handle-redis-pages-refresh',
			data: {},
		})

		await step.sendEvent('send-refresh-blog-list', {
			name: 'blog/handle-blog-list-refresh',
			data: {},
		})

		await step.sendEvent('send-refresh-tag-event', {
			name: 'blog/handle-tag-list-refresh',
			data: { userId: event.data.userId },
		})

		console.log('👍 refreshing til list')
		const tilList = await refreshTilList()

		console.log('👍 refreshing blog list')
		const blogList: Omit<MdxPage, 'code'>[] = (
			await getMdxBlogListGraphql({ ...cachifiedOptions })
		).publishedPages

		console.log('👍 refreshing algolia')
		const blogObjects = [...blogList].map((o) => ({
			...o.matter,
			type: 'blog',
			objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
			content: replaceContent(o?.matter?.content), // strip out the html tags from the content -- this could be better but it fits my needs
		}))

		const tilObjects = [...tilList].map((o) => {
			return {
				...o.matter,
				type: 'til',
				offset: o.offset,
				objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
				content: replaceContent(o?.matter?.content), // strip out the html tags from the content -- this could be better but it fits my needs
			}
		})
		await algoliaIndex.replaceAllObjects([...blogObjects, ...tilObjects])
		console.log('👍 refreshed algolia index with til list')

		return { ok: true }
	},
)
