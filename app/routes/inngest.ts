// app/routes/api.inngest.ts
import { serve } from 'inngest/remix'
import { inngest } from '~/inngest/client'
import { helloWorld } from '~/inngest/hello-world'

const handler = serve({
	client: inngest,
	functions: [helloWorld],
})

export { handler as action, handler as loader }
