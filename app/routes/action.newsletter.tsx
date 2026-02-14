import { parseWithZod } from '@conform-to/zod/v4'
import { redirect, type ActionFunctionArgs } from 'react-router'
import { SpamError } from 'remix-utils/honeypot/server'
import { z } from 'zod'
import { honeypot } from '~/utils/honeypot.server'

export const schema = z.object({
	convertKitFormId: z.string({
		error: (issue) =>
			issue.input === undefined ? 'Form ID is required' : undefined,
	}),
	email: z
		.string({
			error: (issue) =>
				issue.input === undefined ? 'Email is required' : undefined,
		})
		.email('Email is invalid'),
	name: z
		.string({
			error: (issue) =>
				issue.input === undefined ? 'Name is required' : undefined,
		})
		.max(250, 'Name is too long'),
})

export const action = async ({ request }: ActionFunctionArgs) => {
	// return new Response('Error', {status: 500})
	const formData = await request.formData()

	try {
		await honeypot.check(formData)
	} catch (error) {
		if (error instanceof SpamError) {
			// handle spam requests here
			console.log('🤖 tried to spam', error)
			return redirect('https://youtu.be/VM3uXu1Dq4c')
		}
		throw error
	}

	// Replace `Object.fromEntries()` with the parseWithZod helper
	const submission = parseWithZod(formData, { schema })

	// Report the submission to client if it is not successful
	if (submission.status !== 'success') {
		return submission.reply()
	}

	// submit a request to convertkit
	const params = {
		api_key: String(process.env.CONVERT_KIT_API_KEY),
	}
	const queryString = new URLSearchParams(params).toString()
	const response = await fetch(
		`${process.env.CONVERT_KIT_API}/forms/${submission.value.convertKitFormId}/subscribe?${queryString}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: submission.value.email,
				name: submission.value.name,
			}),
		},
	)

	if (response.status !== 200) {
		return submission.reply({
			formErrors: ['Failed to subscribe. Please try again later.'],
		})
	}

	return submission
}
