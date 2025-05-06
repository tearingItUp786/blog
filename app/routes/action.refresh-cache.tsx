import { type ActionFunction, redirect } from 'react-router'
import { z } from 'zod'
import { fileSchema, inngest } from '~/inngest/client'

const BodySchema = z.object({
	contentFiles: z.array(fileSchema),
})

export const action: ActionFunction = async ({ request }) => {
	// hahaha
	if (request.headers.get('auth') !== process.env.REFRESH_CACHE_SECRET) {
		return redirect('https://youtu.be/VM3uXu1Dq4c')
	}

	const jsonData = await request.json()
	try {
		const body = BodySchema.parse(jsonData)
		const { contentFiles } = body
		if (!contentFiles) {
			return { ok: false }
		}

		// refresh til list, blog list, all blog articles, tag list, and  tags
		const forceFresh = request.headers.get('x-force-fresh') === 'true'

		await inngest.send({
			name: 'blog/refresh-cache',
			data: {
				contentFiles,
				forceFresh,
			},
		})

		return { ok: true }
	} catch (err) {
		console.error(err)
		return { ok: false }
	}
}
