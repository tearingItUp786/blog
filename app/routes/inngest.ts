import { serve } from 'inngest/remix'
import { inngest } from '~/inngest/client'
import {
	handleBlogListRefresh,
	handleManualRefresh,
	handleRedisPagesRefresh,
	handleTagListRefresh,
	refreshBlogFiles,
	refreshCache,
	refreshSingleTag,
	refreshTilList,
} from '~/inngest/refresh-cache'

const handler = serve({
	client: inngest,
	functions: [
		refreshCache,
		refreshBlogFiles,
		refreshTilList,
		handleManualRefresh,
		handleTagListRefresh,
		handleBlogListRefresh,
		handleRedisPagesRefresh,
		refreshSingleTag,
	],
})

export { handler as action, handler as loader }
