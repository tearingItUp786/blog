import { liteClient } from 'algoliasearch/lite'

function createAlgoliaSearchClient() {
	if (typeof window === 'undefined') {
		throw new Error('Algolia search client can only be created in the browser')
	}

	const { ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY } = window.ENV

	if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY) {
		throw new Error('Missing Algolia browser environment variables')
	}

	return liteClient(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)
}

const algoliaSearchClient = createAlgoliaSearchClient()

export { algoliaSearchClient }
