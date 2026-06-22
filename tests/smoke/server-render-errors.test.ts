import { describe, expect, it } from 'vitest'

import { shouldTreatServerRenderErrorAsFatal } from '~/utils/server-render-errors.server'

describe('server render error handling', () => {
	it('does not treat expected route responses as fatal render errors', () => {
		expect(
			shouldTreatServerRenderErrorAsFatal(
				new Response('Not found', { status: 404 }),
			),
		).toBe(false)
		expect(
			shouldTreatServerRenderErrorAsFatal(
				new Response('Method not allowed', { status: 405 }),
			),
		).toBe(false)
		expect(
			shouldTreatServerRenderErrorAsFatal({
				status: 404,
				statusText: 'Not Found',
				data: 'Not Found',
				internal: false,
			}),
		).toBe(false)
	})

	it('treats server responses and thrown errors as fatal', () => {
		expect(
			shouldTreatServerRenderErrorAsFatal(
				new Response('Server error', { status: 500 }),
			),
		).toBe(true)
		expect(shouldTreatServerRenderErrorAsFatal(new Error('boom'))).toBe(true)
	})
})
