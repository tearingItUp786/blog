import React from 'react'
import * as mdxBundler from 'mdx-bundler/client'
import * as myTypo from '~/components/typography'
import type { MdxPage } from 'types'
import {
  downloadDirList,
  downloadMdxFileOrDirectory,
} from '~/utils/github.server'
import { compileMdx } from './mdx.server'

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
  const pageFiles = await downloadMdxFileOrDirectory(`${contentDir}/${slug}`)
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
}

const mdxComponents = {
  // h1: myTypo.H1,
  // h2: myTypo.H2,
  // h3: myTypo.H3,
  // h4: myTypo.H4,
  // h5: myTypo.H5,
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

async function getMdxBlogList() {
  const blogFiles = await downloadMdxFileOrDirectory('blog')
  const mdxFiles = blogFiles.files.filter((file) => file.path.includes('.mdx'))

  const compileCode = await Promise.all(
    mdxFiles.map(async (file) => {
      return {
        mdx: await compileMdx<MdxPage['frontmatter']>('', [file]).catch((err) => {
          console.error(`Failed to compile mdx:`, {
            path: file.path,
            file,
          })
          return Promise.reject(err)
        }),
        path: file.path,
      }
    })
  )

  return compileCode
    .filter((value) => value.mdx !== null)
    .map((value) => {
      if (value.mdx) {
        return {
          frontmatter: value.mdx.frontmatter,
          readTime: value.mdx.readTime,
          path: value.path.replace('index.mdx', '').replace('content', ''),
        }
      }
    })
}

function useMdxComponent(code: string) {
  return React.useMemo(() => getMdxComponent(code), [code])
}

export { getMdxPage, getMdxBlogList, useMdxComponent }
