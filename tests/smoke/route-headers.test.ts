import { type HeadersArgs } from 'react-router'
import { describe, expect, it } from 'vitest'

import * as aboutRoute from '~/routes/about/route'
import * as blogSlugRoute from '~/routes/blog.$slug/route'

const baseArgs: HeadersArgs = {
	actionHeaders: new Headers(),
	errorHeaders: undefined,
	loaderHeaders: new Headers(),
	parentHeaders: new Headers(),
}

function getHeadersExport(module: object) {
	return Reflect.get(module, 'headers') as
		| ((args: HeadersArgs) => Headers | HeadersInit)
		| undefined
}

describe('route document headers', () => {
	it('keeps the about page private and cookie-aware', () => {
		const headersExport = getHeadersExport(aboutRoute)

		expect(headersExport).toBeTypeOf('function')

		const headers = new Headers(headersExport!(baseArgs))

		expect(headers.get('Cache-Control')).toBe('private, max-age=604800')
		expect(headers.get('Vary')).toBe('Cookie')
	})

	it('keeps blog posts private and cookie-aware', () => {
		const headersExport = getHeadersExport(blogSlugRoute)

		expect(headersExport).toBeTypeOf('function')

		const headers = new Headers(headersExport!(baseArgs))

		expect(headers.get('Cache-Control')).toBe('private, max-age=3600')
		expect(headers.get('Vary')).toBe('Cookie')
	})
})
