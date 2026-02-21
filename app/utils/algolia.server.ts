import { algoliasearch } from 'algoliasearch'

type AlgoliaClient = ReturnType<typeof algoliasearch>

type AlgoliaIndex = {
	replaceAllObjects: (
		objects: Parameters<AlgoliaClient['replaceAllObjects']>[0]['objects'],
	) => ReturnType<AlgoliaClient['replaceAllObjects']>
	saveObjects: (
		objects: Parameters<AlgoliaClient['saveObjects']>[0]['objects'],
	) => ReturnType<AlgoliaClient['saveObjects']>
	deleteObject: (objectID: string) => ReturnType<AlgoliaClient['deleteObject']>
	getObject: (objectID: string) => ReturnType<AlgoliaClient['getObject']>
}

type AlgoliaClientWithInitIndex = AlgoliaClient & {
	initIndex: (indexName: string) => AlgoliaIndex
}

declare global {
	var algoliaClient: AlgoliaClientWithInitIndex
}

function attachInitIndex(client: AlgoliaClient): AlgoliaClientWithInitIndex {
	return Object.assign(client, {
		initIndex(indexName: string): AlgoliaIndex {
			return {
				replaceAllObjects(objects) {
					return client.replaceAllObjects({ indexName, objects })
				},
				saveObjects(objects) {
					return client.saveObjects({ indexName, objects })
				},
				deleteObject(objectID) {
					return client.deleteObject({ indexName, objectID })
				},
				getObject(objectID) {
					return client.getObject({ indexName, objectID })
				},
			}
		},
	})
}

function createAgoliaClient(): AlgoliaClientWithInitIndex {
	if (!global.algoliaClient) {
		const client = algoliasearch(
			process.env.ALGOLIA_APP_ID,
			process.env.ALGOLIA_ADMIN_KEY,
		)

		global.algoliaClient = attachInitIndex(client)
	}

	return global.algoliaClient
}

const algoliaClient = createAgoliaClient()

export type { AlgoliaClientWithInitIndex, AlgoliaIndex }
export { algoliaClient }
