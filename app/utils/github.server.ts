import {graphql} from '@octokit/graphql'
import {throttling} from '@octokit/plugin-throttling'
import {Octokit as createOctokit} from '@octokit/rest'
import {type GithubGraphqlObject} from 'types'

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

const Octokit = createOctokit.plugin(throttling)

type ThrottleOptions = {
  method: string
  url: string
  request: {retryCount: number}
}
const octokit = new Octokit({
  auth: process.env.BOT_GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter: number, options: ThrottleOptions) => {
      console.warn(
        `Request quota exhausted for request ${options.method} ${options.url}. Retrying after ${retryAfter} seconds.`,
      )

      return true
    },
    onAbuseLimit: (_retryAfter: number, options: ThrottleOptions) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `Abuse detected for request ${options.method} ${options.url}`,
      )
    },
  },
})

export {downloadDirGql}
