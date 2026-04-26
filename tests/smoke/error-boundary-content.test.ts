import { describe, expect, it } from 'vitest'

import {
	getErrorBoundaryContent,
	shouldCaptureErrorBoundaryError,
} from '~/utils/error-boundary-content'

const routeError = {
	status: 404,
	statusText: 'Not Found',
	data: null,
	internal: false,
}

describe('error boundary content', () => {
	it('uses the not-found content for route error responses', () => {
		const content = getErrorBoundaryContent(routeError)

		expect(content.heading).toBe('Not found: 404')
		expect(content.iframeTitle).toBe('Not Found')
		expect(content.iframeSrc).toContain('UHAYP0FxJOmFBuOiC2')
		expect(content.creditHref).toContain('UHAYP0FxJOmFBuOiC2')
	})

	it('uses the server-error content for unknown errors', () => {
		const content = getErrorBoundaryContent(new Error('nope'))

		expect(content.heading).toBe('Something went wrong with the server')
		expect(content.iframeTitle).toBe('Not sure what happened')
		expect(content.iframeSrc).toContain('7wUn5bkB2fUBY8Jo1D')
		expect(content.creditHref).toContain('7wUn5bkB2fUBY8Jo1D')
	})

	it('only captures unexpected errors', () => {
		expect(shouldCaptureErrorBoundaryError(routeError)).toBe(false)
		expect(shouldCaptureErrorBoundaryError(new Error('boom'))).toBe(true)
	})
})
