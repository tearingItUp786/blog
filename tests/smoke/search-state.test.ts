import { describe, expect, it } from 'vitest'

import {
	initialSearchState,
	searchStateReducer,
	shouldShowSearchToast,
} from '~/components/navbar/search-state'

describe('search state reducer', () => {
	it('marks search as rendered and waiting to open after an initial open request', () => {
		const nextState = searchStateReducer(initialSearchState, {
			type: 'request-open',
		})

		expect(nextState).toEqual({
			hasRenderedSearch: true,
			isSearchReady: false,
			hasPendingOpenRequest: true,
		})
	})

	it('marks search as ready without dropping a pending open request', () => {
		const pendingOpenState = searchStateReducer(initialSearchState, {
			type: 'request-open',
		})

		const nextState = searchStateReducer(pendingOpenState, {
			type: 'ready',
		})

		expect(nextState).toEqual({
			hasRenderedSearch: true,
			isSearchReady: true,
			hasPendingOpenRequest: true,
		})
	})

	it('clears the pending open request once the UI has been opened', () => {
		const readyToOpenState = {
			hasRenderedSearch: true,
			isSearchReady: true,
			hasPendingOpenRequest: true,
		}

		expect(searchStateReducer(readyToOpenState, { type: 'opened' })).toEqual({
			hasRenderedSearch: true,
			isSearchReady: true,
			hasPendingOpenRequest: false,
		})
	})

	it('shows the loading toast only while an open request is waiting on mount', () => {
		expect(shouldShowSearchToast(initialSearchState)).toBe(false)
		expect(
			shouldShowSearchToast({
				hasRenderedSearch: true,
				isSearchReady: false,
				hasPendingOpenRequest: true,
			}),
		).toBe(true)
		expect(
			shouldShowSearchToast({
				hasRenderedSearch: true,
				isSearchReady: true,
				hasPendingOpenRequest: false,
			}),
		).toBe(false)
	})
})
