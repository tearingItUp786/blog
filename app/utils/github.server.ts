import { setTimeout as delay } from 'node:timers/promises'
import { graphql } from '@octokit/graphql'
import {
	GithubDownloadDirResponseSchema,
	type GithubDownloadDirResponse,
} from '~/schemas/github'

const graphqlWithAuth = graphql.defaults({
	headers: {
		authorization: `token ${process.env.BOT_GRAPHQL_TOKEN}`,
	},
})

async function downloadDirGql(
	slug: string,
): Promise<GithubDownloadDirResponse> {
	const query = `
      query downloadDir($slug: String!) {
         repository(owner: "tearingitup786", name: "blog") {
          object(expression: $slug) {
            ... on Tree {
              entries {
                name
                object {
                  ... on Blob {
                    text
                  }
                  ... on Tree {
                    entries {
                      name
                      type
                      object {
                        ... on Blob {
                          text
                        }
                        ... on Tree {
                          entries {
                            name
                            object {
                              ... on Blob {
                                text
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
`

	for (let attempt = 0; ; attempt++) {
		try {
			const data = await graphqlWithAuth(query, { slug: `main:${slug}` })
			return GithubDownloadDirResponseSchema.parse(data)
		} catch (error) {
			// Retry temporary gateway failures, not auth/rate limits or invalid data.
			if (
				attempt >= 2 ||
				!(error instanceof Error) ||
				!('status' in error) ||
				![502, 503, 504].includes(Number(error.status))
			) {
				throw error
			}
			await delay(250 * 2 ** attempt)
		}
	}
}
export { downloadDirGql }
