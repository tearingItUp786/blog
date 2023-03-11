import algoliasearch from 'algoliasearch'

declare global {
  var algoliaClient: ReturnType<typeof algoliasearch>
}

function createAgoliaClient(): ReturnType<typeof algoliasearch> {
  if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) {
    throw new Error(
      `You must provide an Algolia App ID and Admin API Key in your environment variables.`,
    )
  }

  if (!algoliaClient) {
    algoliaClient = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_KEY,
    )
  }

  return algoliaClient
}

let algoliaClient = createAgoliaClient()

export {algoliaClient}
