/// <reference types="@remix-run/node/globals" />

import type calculateReadingTime from 'reading-time'

export type GitHubFile = {path: string; content: string}

export type GithubGrapqhlObject = {
  name: string
  text?: string
  entries?: GithubGrapqhlObject[]
  object: GithubGrapqhlObject
}

export type MdxPage = {
  code?: string
  readTime?: ReturnType<typeof calculateReadingTime>

  frontmatter: {
    title?: string
    subtitle?: string
    description?: string
    date?: string
    tag?: string
  }

  readTime: {
    minutes: number
    text: string
    time: number
    words: number
  }
}

export type MdxPageAndSlug = MdxPage & {
  slug?: string
  path?: string
}
