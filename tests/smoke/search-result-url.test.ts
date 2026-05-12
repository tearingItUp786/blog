import { describe, expect, it } from 'vitest'

import { getSearchResultUrl } from '~/components/navbar/search-result-url'

describe('getSearchResultUrl', () => {
	it('generates a blog result URL', () => {
		expect(
			getSearchResultUrl({ type: 'blog', objectID: 'my-slug', query: 'react' }),
		).toBe('/blog/my-slug?q=react')
	})

	it('generates a TIL result URL with offset', () => {
		expect(
			getSearchResultUrl({
				type: 'til',
				objectID: '2026-01-01-post',
				offset: 3,
				query: 'testing',
			}),
		).toBe('/til?offset=3&q=testing#2026-01-01-post')
	})

	it('encodes special characters in query', () => {
		expect(
			getSearchResultUrl({
				type: 'blog',
				objectID: 'my-slug',
				query: 'hello world',
			}),
		).toBe('/blog/my-slug?q=hello+world')
	})

	it('defaults TIL offset to 1 when missing', () => {
		expect(
			getSearchResultUrl({
				type: 'til',
				objectID: 'some-post',
				query: 'go',
			}),
		).toBe('/til?offset=1&q=go#some-post')
	})
})
