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
	const data = await graphqlWithAuth(
		`
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
`,
		{
			slug: `main:${slug}`,
		},
	)

	return GithubDownloadDirResponseSchema.parse(data)
}
export { downloadDirGql }
