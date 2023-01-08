import React from 'react'
import * as mdxBundler from 'mdx-bundler/client'
import * as myTypo from '~/components/typography'
import type { MdxPage } from 'types'
import {
  downloadDirList,
  downloadMdxFileOrDirectory,
} from '~/utils/github.server'
import { compileMdx } from './mdx.server'
import { redisCache } from './redis.server'
import cachified, { verboseReporter } from 'cachified'

const checkCompiledValue = (value: unknown) =>
  typeof value === 'object' &&
  (value === null || ('code' in value && 'frontmatter' in value))

async function getMdxPage({
  contentDir,
  slug,
}: {
  contentDir: string
  slug: string
}): Promise<MdxPage | null> {
  return cachified({
    key: `${contentDir}:${slug}`,
    cache: redisCache,
    forceFresh: true,
    getFreshValue: async () => {
      const pageFiles = await downloadMdxFileOrDirectory(
        `${contentDir}/${slug}`
      )

      const compiledPage = await compileMdx<MdxPage['frontmatter']>(
        slug,
        pageFiles.files
      ).catch((err) => {
        console.error(`Failed to compile mdx:`, {
          contentDir,
          slug,
        })
        return Promise.reject(err)
      })

      return compiledPage
    },
    reporter: verboseReporter(),
  })
}

const mdxComponents = {
  ...myTypo,
}

/**
 * This should be rendered within a useMemo
 * @param code the code to get the component from
 * @returns the component
 */
function getMdxComponent(code: string) {
  const Component = mdxBundler.getMDXComponent(code)
  function KCDMdxComponent({
    components,
    ...rest
  }: Parameters<typeof Component>['0']) {
    return (
      <Component components={{ ...mdxComponents, ...components }} {...rest} />
    )
  }
  return KCDMdxComponent
}

async function getMdxDirList(contentDir: string) {
  const fullContentDirPath = `content/${contentDir}`

  return cachified({
    key: `getMdxDirList-${fullContentDirPath}`,
    cache: redisCache,
    forceFresh: true,
    getFreshValue: async () => {
      const dirList = (await downloadDirList(fullContentDirPath)).map(
        ({ name, path, ...rest }) => ({
          name,
          slug: path.replace('index.mdx', '').replace('content/', ''),
          ...rest,
        })
      )

      return dirList.sort((a, b) => {
        return b.name.toLowerCase().localeCompare(a.name.toLowerCase())
      })
    },
    reporter: verboseReporter(),
  })
}

async function getMdxTilList(page = 1) {
  return cachified({
    key: `til-list:${page}`,
    cache: redisCache,
    forceFresh: true,
    getFreshValue: async () => {
      const mdxDirList = await getMdxDirList('til')
      const sliceIndex = (page - 1) * 10
      const dirList = mdxDirList.slice(sliceIndex, sliceIndex + 10)

      const pageDatas = await Promise.all(
        dirList.map(async ({ slug }) => {
          return {
            ...(await downloadMdxFileOrDirectory(slug)),
            slug,
          }
        })
      )

      const pages = await Promise.all(
        pageDatas.map((pageData) => compileMdx(pageData.slug, pageData.files))
      )

      let test = pages.map((page, i) => {
        return {
          ...page,
          path: pageDatas?.[i]?.slug ?? '',
        }
      })
      return test
    },
  })
}

async function getMdxBlogList() {
  return cachified({
    key: 'blog-list',
    cache: redisCache,
    forceFresh: true,
    getFreshValue: async () => {
      const dirList = await getMdxDirList('blog')

      const pageDatas = await Promise.all(
        dirList.map(async ({ slug }) => {
          return {
            ...(await downloadMdxFileOrDirectory(slug)),
            slug,
          }
        })
      )

      const pages = await Promise.all(
        pageDatas.map((pageData) => compileMdx(pageData.slug, pageData.files))
      )

      return pages
        .map((page, i) => {
          if (!page) return null
          return {
            ...mapFromMdxPageToMdxListItem(page),
            path: pageDatas?.[i]?.slug ?? '',
          }
        })
        .filter((v) => v && Boolean(v.path))
    },
  })
}

function mapFromMdxPageToMdxListItem(page: MdxPage): Omit<MdxPage, 'code'> {
  const { code, ...mdxListItem } = page
  return mdxListItem
}

function useMdxComponent(code: string) {
  return React.useMemo(() => getMdxComponent(code), [code])
}

export {
  getMdxPage,
  getMdxBlogList,
  getMdxTilList,
  useMdxComponent,
  getMdxComponent,
}
