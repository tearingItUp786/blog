import { graphql } from '@octokit/graphql'
import { type GithubGraphqlObject } from 'types'

const graphqlWithAuth = graphql.defaults({
	headers: {
		authorization: `token ${process.env.BOT_GRAPHQL_TOKEN}`,
	},
})

async function downloadDirGql(slug: string) {
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

	return data as {
		repository: GithubGraphqlObject
	}
}
export { downloadDirGql }
