import algoliasearch from 'algoliasearch'

declare global {
  var algoliaClient: ReturnType<typeof algoliasearch>
}

function createAgoliaClient(): ReturnType<typeof algoliasearch> {
  if (!global.algoliaClient) {
    global.algoliaClient = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_KEY,
    )
  }

  return global.algoliaClient
}

const algoliaClient = createAgoliaClient()

export {algoliaClient}
