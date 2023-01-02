import { json, useLoaderData, LoaderFunction, LoaderData } from 'remix'
import { downloadMdxFileOrDirectory } from '~/utils/github.server'
import { compileMdx } from '~/utils/mdx.server'

export const loader: LoaderFunciton = async ({ params, request }) => {
  const firstTest = await downloadMdxFileOrDirectory('blog')
  const test = firstTest.files.filter((file) => file.path.includes('.mdx'))
  const compiledStuff = await Promise.all(
    test.map((file) => compileMdx('', [file]))
  )
  return json({ compiledStuff, test }, { status: 200 })
}

export default function Blog() {
  const data = useLoaderData<LoaderData>()
  console.log('yo', data)
  return <div>Blog List </div>
}

// need to compile each mdx file using mdx-bundler
// get the frontmatter and the code
// truncate the code to 300 characters without breaking the bundler
