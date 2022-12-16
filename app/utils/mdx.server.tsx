import { bundleMDX } from 'mdx-bundler'

import calculateReadingTime from 'reading-time'
import type TPQueue from 'p-queue'
import type { GitHubFile } from 'types'

async function compileMdx<FrontmatterType extends Record<string, unknown>>(
  slug: string,
  githubFiles: Array<GitHubFile>
) {
  const { default: remarkAutolinkHeadings } = await import(
    'remark-autolink-headings'
  )
  const { default: gfm } = await import('remark-gfm')
  const { default: capitalize } = await import('remark-capitalize')
  const { default: emoji } = await import('remark-emoji')
  const { default: smartypants } = await import('remark-smartypants')
  const { default: remarkImages } = await import('remark-images')
  // rehype plugins
  const { default: rehypeCodeTitles } = await import('rehype-code-titles')
  const { default: rehypePrismPlus } = await import('rehype-prism-plus')
  const { default: rehypeSlug } = await import('rehype-slug')
  const { default: rehypeAutolinkHeadings } = await import(
    'rehype-autolink-headings'
  )
  const { default: rehypeAddClasses } = await import('rehype-add-classes')

  const indexRegex = new RegExp(`${slug}\\/index.mdx?$`)
  const indexFile = githubFiles.find(({ path }) => indexRegex.test(path))
  if (!indexFile) return null

  const rootDir = indexFile.path.replace(/index.mdx?$/, '')
  const relativeFiles: Array<GitHubFile> = githubFiles.map(
    ({ path, content }) => ({
      path: path.replace(rootDir, './'),
      content,
    })
  )
  const files = arrayToObj(relativeFiles, {
    keyName: 'path',
    valueName: 'content',
  })

  try {
    const { frontmatter, code } = await bundleMDX({
      source: indexFile.content,
      files,
      cwd: '/app/components/',
      mdxOptions(options) {
        options.remarkPlugins = [
          ...(options.remarkPlugins ?? []),
          capitalize,
          emoji,
          gfm,
          smartypants,
          [remarkImages, { maxWidth: 1200 }],
          [remarkAutolinkHeadings, { behavior: 'wrap' }],
        ]
        options.rehypePlugins = [
          ...(options.rehypePlugins ?? []),
          rehypeCodeTitles,
          [rehypePrismPlus, { showLineNumbers: true }],
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
                      fillRule: 'evenodd',
                      d: `M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z`,
                    },
                  },
                ],
              },
            },
          ],
          [rehypeAddClasses, { 'h1,h2,h3,h4,h5,h6': 'title' }],
        ]
        return options
      },
    })
    const readTime = calculateReadingTime(indexFile.content)

    return {
      code,
      readTime,
      frontmatter: frontmatter as FrontmatterType,
    }
  } catch (error: unknown) {
    console.error(`Compilation error for slug: `, slug)
    // @ts-ignore
    console.error(error.errors[0])
    throw error
  }
}

function arrayToObj<ItemType extends Record<string, unknown>>(
  array: Array<ItemType>,
  { keyName, valueName }: { keyName: keyof ItemType; valueName: keyof ItemType }
) {
  const obj: Record<string, ItemType[keyof ItemType]> = {}
  for (const item of array) {
    const key = item[keyName]
    if (typeof key !== 'string') {
      throw new Error(`${keyName} of item must be a string`)
    }
    const value = item[valueName]
    obj[key] = value
  }
  return obj
}

let _queue: TPQueue | null = null
async function getQueue() {
  const { default: PQueue } = await import('p-queue')
  if (_queue) return _queue

  _queue = new PQueue({ concurrency: 1 })
  return _queue
}

// We have to use a queue because we can't run more than one of these at a time
// or we'll hit an out of memory error because esbuild uses a lot of memory...
async function queuedCompileMdx<
  FrontmatterType extends Record<string, unknown>
>(...args: Parameters<typeof compileMdx>) {
  const queue = await getQueue()
  const result = await queue.add(() => compileMdx<FrontmatterType>(...args))
  return result
}

export { queuedCompileMdx as compileMdx }
