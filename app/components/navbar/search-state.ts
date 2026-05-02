export type SearchState = {
	hasRenderedSearch: boolean
	isSearchReady: boolean
	hasPendingOpenRequest: boolean
}

export type SearchAction =
	| { type: 'request-open' }
	| { type: 'ready' }
	| { type: 'opened' }

export const initialSearchState: SearchState = {
	hasRenderedSearch: false,
	isSearchReady: false,
	hasPendingOpenRequest: false,
}

export function searchStateReducer(
	state: SearchState,
	action: SearchAction,
): SearchState {
	switch (action.type) {
		case 'request-open':
			return {
				...state,
				hasRenderedSearch: true,
				hasPendingOpenRequest: true,
			}
		case 'ready':
			return {
				...state,
				hasRenderedSearch: true,
				isSearchReady: true,
			}
		case 'opened':
			return {
				...state,
				hasPendingOpenRequest: false,
			}
	}
}

export function shouldShowSearchToast(state: SearchState) {
	return state.hasPendingOpenRequest && !state.isSearchReady
}
