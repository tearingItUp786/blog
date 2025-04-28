import { serve } from 'inngest/remix'
import { inngest } from '~/inngest/client'
import {
	handleTagListRefresh,
	manualRefreshFunction,
	refreshCache,
} from '~/inngest/refresh-cache'

const handler = serve({
	client: inngest,
	functions: [refreshCache, handleTagListRefresh, manualRefreshFunction],
})

export { handler as action, handler as loader }
