type Body = { contentFiles: Array<File> }
import { type ActionFunction, redirect } from 'react-router'
import { inngest } from '~/inngest/client'

export const action: ActionFunction = async ({ request }) => {
	// hahaha
	if (request.headers.get('auth') !== process.env.REFRESH_CACHE_SECRET) {
		return redirect('https://youtu.be/VM3uXu1Dq4c')
	}

	const { contentFiles } = (await request.json()) as Body

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
}
