import { describe, expect, it } from 'vitest'

import { getTilRssItemUrl, shouldUseTilScrollFallback } from '~/utils/til-url'

describe('getTilRssItemUrl', () => {
	it('keeps the hash and duplicates the target slug as a query fallback', () => {
		expect(
			getTilRssItemUrl({
				baseUrl: 'https://taranveerbains.ca/til',
				offset: 14,
				slug: '2026-05-28-herdr',
			}),
		).toBe(
			'https://taranveerbains.ca/til?offset=14&til=2026-05-28-herdr#2026-05-28-herdr',
		)
	})
})

describe('shouldUseTilScrollFallback', () => {
	it('allows fallback scrolling for initial document loads without a hash', () => {
		expect(
			shouldUseTilScrollFallback({
				initialDocumentUrl: '/til?offset=14&til=2026-05-28-herdr',
				currentDocumentUrl: '/til?offset=14&til=2026-05-28-herdr',
				hash: '',
				targetId: '2026-05-28-herdr',
			}),
		).toBe(true)
	})

	it('does not fallback scroll when native hash navigation is available', () => {
		expect(
			shouldUseTilScrollFallback({
				initialDocumentUrl: '/til?offset=14&til=2026-05-28-herdr',
				currentDocumentUrl: '/til?offset=14&til=2026-05-28-herdr',
				hash: '#2026-05-28-herdr',
				targetId: '2026-05-28-herdr',
			}),
		).toBe(false)
	})

	it('does not fallback scroll during client-side navigation', () => {
		expect(
			shouldUseTilScrollFallback({
				initialDocumentUrl: '/blog',
				currentDocumentUrl: '/til?offset=14&til=2026-05-28-herdr',
				hash: '',
				targetId: '2026-05-28-herdr',
			}),
		).toBe(false)
	})

	it('does not fallback scroll without a target id', () => {
		expect(
			shouldUseTilScrollFallback({
				initialDocumentUrl: '/til?offset=14',
				currentDocumentUrl: '/til?offset=14',
				hash: '',
				targetId: null,
			}),
		).toBe(false)
	})
})
