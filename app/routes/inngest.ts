// app/routes/api.inngest.ts
import { serve } from 'inngest/remix'
import { inngest } from '~/inngest/client'
import { helloWorld } from '~/inngest/hello-world'
import { refreshCache } from '~/inngest/refresh-cache'

const handler = serve({
	client: inngest,
	functions: [helloWorld, refreshCache],
})

export { handler as action, handler as loader }
