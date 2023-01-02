import { json, useLoaderData, LoaderFunction, LoaderData } from 'remix'
import { downloadMdxFileOrDirectory } from '~/utils/github.server'

export const loader: LoaderFunciton = async ({ params, request }) => {
  const test = await downloadMdxFileOrDirectory('blog')
  console.log('test', test)
  return json({ test }, { status: 200 })
}

export default function Blog() {
  const { data } = useLoaderData<LoaderData>()
  console.log('yo', data)
  return <div>Blog List </div>
}
