/// <reference types="@remix-run/node/globals" />

import type calculateReadingTime from 'reading-time'

export type GitHubFile = { path: string; content: string }

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
}

export type MdxPageAndSlug = MdxPage & {
  slug?: string
  path?: string
}
