import {bundleMDX} from 'mdx-bundler'
import remarkEmbedder from '@remark-embedder/core'
import type {Config} from '@remark-embedder/transformer-oembed'
import oembedTransformer from '@remark-embedder/transformer-oembed'
import calculateReadingTime from 'reading-time'
import type TPQueue from 'p-queue'
import type {TransformerInfo} from '@remark-embedder/core'
import mdxMermaid from 'mdx-mermaid'

import type {GithubGraphqlObject} from 'types'
import path from 'path'

if (process.platform === 'win32') {
  process.env.ESBUILD_BINARY_PATH = path.join(
    process.cwd(),
    'node_modules',
    'esbuild',
    'esbuild.exe',
  )
} else {
  process.env.ESBUILD_BINARY_PATH = path.join(
    process.cwd(),
    'node_modules',
    'esbuild',
    'bin',
    'esbuild',
  )
}

function handleEmbedderError({url}: {url: string}) {
  return `<p>Error embedding <a href="${url}">${url}</a></p>.`
}

type GottenHTML = string | null

function handleEmbedderHtml(html: GottenHTML, info: TransformerInfo) {
  if (!html) return null

  const url = new URL(info.url)
  // matches youtu.be and youtube.cm
  if (/youtu\.?be/.test(url.hostname)) {
    // this allows us to set youtube embeds to 100% width and the
    // height will be relative to that width with a good aspect ratio
    let ret = html.slice(0, 8) + 'loading="lazy" class="lazy"' + html.slice(8)
    return makeEmbed(ret.replace('src', 'data-src'), 'youtube')
  }
  if (url.hostname.includes('codesandbox.io')) {
    return makeEmbed(html, 'codesandbox', '80%')
  }
  return html
}

function makeEmbed(html: string, type: string, heightRatio = '56.25%') {
  return `
  <div class="embed" data-embed-type="${type}">
    <div style="padding-bottom: ${heightRatio}">
      ${html}
    </div>
  </div>
`
}

export async function compileMdxForGraphql<
  FrontmatterType extends Record<string, unknown>,
>(slug: string, githubFiles: Array<GithubGraphqlObject>) {
  const {default: remarkAutolinkHeadings} = await import(
    'remark-autolink-headings'
  )
  const {default: gfm} = await import('remark-gfm')
  const {default: capitalize} = await import('remark-capitalize')
  const {default: emoji} = await import('remark-emoji')
  const {default: smartypants} = await import('remark-smartypants')
  const {default: remarkImages} = await import('remark-images')
  const {default: remarkToc} = await import('remark-toc')

  // rehype plugins
  const {default: rehypePrismPlus} = await import('rehype-prism-plus')
  const {default: rehypeSlug} = await import('rehype-slug')
  const {default: rehypeAutolinkHeadings} = await import(
    'rehype-autolink-headings'
  )
  const {default: rehypeCodeTitles} = await import('rehype-code-titles')
  const {default: rehypeAddClasses} = await import('rehype-add-classes')
  const {default: rehypeExternalLinks} = await import('rehype-external-links')

  const mdxFile = githubFiles.find(val => {
    return val?.name?.includes('mdx')
  })

  let files = githubFiles.reduce((acc, val) => {
    if (!val.object.text) return acc

    acc[val?.name ?? ''] = val.object.text
    return {
      ...acc,
    }
  }, {} as Record<string, string>)

  if (!mdxFile) return null

  try {
    const mdxText = mdxFile.object?.text ?? ''
    const {frontmatter, code, matter} = await bundleMDX({
      source: mdxText,
      files,
      mdxOptions(options) {
        options.remarkPlugins = [
          ...(options.remarkPlugins ?? []),
          [mdxMermaid, {output: 'svg'}],
          [remarkToc, {tight: true}],
          capitalize,
          [emoji, {accessible: true}],
          gfm,
          smartypants,
          [remarkImages, {maxWidth: 1200}],
          [remarkAutolinkHeadings, {behavior: 'wrap'}],
          [
            remarkEmbedder,
            {
              handleError: handleEmbedderError,
              handleHTML: handleEmbedderHtml,
              transformers: [
                [
                  oembedTransformer,
                  {
                    params: {
                      height: '390',
                      width: '1280',
                      theme: 'dark',
                      dnt: true,
                      omit_script: true,
                    } as Config,
                  },
                ],
              ],
            },
          ],
        ]
        options.rehypePlugins = [
          ...(options.rehypePlugins ?? []),
          [
            rehypeCodeTitles,
            {titleSeparator: ':title=', customClassName: 'custom-code-title'},
          ],
          [rehypePrismPlus, {showLineNumbers: true}],
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'prepend',
              properties: {
                tabIndex: 0,
              },
              content: {
                type: 'element',
                tagName: 'svg',
                properties: {
                  ariaHidden: true,
                  focusable: false,
                  viewBox: '0 0 16 16',
                  height: 16,
                  width: 16,
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                      className: 'fill-accent stroke-accent',
                      fillRule: 'evenodd',
                      d: 'M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z',
                    },
                  },
                ],
              },
            },
          ],
          [rehypeAddClasses, {'h1,h2,h3,h4,h5,h6': 'title'}],
          [
            rehypeExternalLinks,
            {
              target: '_blank',
              rel: ['noopener'],
            },
          ],
        ]
        return options
      },
    })
    const readTime = calculateReadingTime(mdxText)
    if (frontmatter.tag) frontmatter.tag = frontmatter.tag?.toLowerCase()

    return {
      code,
      readTime,
      // @important: we need to stringify and parse the frontmatter
      // because the Date can be a string or a Date object
      frontmatter: JSON.parse(JSON.stringify(frontmatter)) as FrontmatterType,
      matter,
      slug,
    }
  } catch (error: unknown) {
    console.error(`Compilation error for slug: `, slug)
    // @ts-ignore
    console.error(error.errors[0])
    throw error
  }
}

let _queue: TPQueue | null = null
async function getQueue() {
  const {default: PQueue} = await import('p-queue')
  if (_queue) return _queue

  _queue = new PQueue({concurrency: 4})
  return _queue
}

// We have to use a queue because we can't run more than one of these at a time
// or we'll hit an out of memory error because esbuild uses a lot of memory...
async function queuedCompileMdxGql<
  FrontmatterType extends Record<string, unknown>,
>(...args: Parameters<typeof compileMdxForGraphql>) {
  const queue = await getQueue()
  const result = await queue.add(() =>
    compileMdxForGraphql<FrontmatterType>(...args),
  )

  return result
}

export {queuedCompileMdxGql}
