import {ActionFunction, json, redirect} from '@remix-run/node'
import {
  getMdxBlogListGraphql,
  getMdxPageGql,
  getMdxTilListGql,
} from '~/utils/mdx'

type File = {
  changeType: string
  filename: string
}
type Body = {contentFiles: Array<File>}

export const action: ActionFunction = async ({request}) => {
  if (request.headers.get('auth') !== process.env.REFRESH_CACHE_SECRET) {
    return redirect('https://youtu.be/VM3uXu1Dq4c')
  }

  const {contentFiles} = (await request.json()) as Body

  if (!contentFiles) {
    return json({ok: false})
  }

  const [bFiles, tilFiles] = contentFiles.reduce(
    (acc, file) => {
      if (file.filename.startsWith('content/blog')) {
        acc[0].push(file)
      } else if (file.filename.startsWith('content/til')) {
        acc[1].push(file)
      }
      return acc
    },
    [[], []] as [File[], File[]],
  )
  // if we edited a content file, call the fetcher function for getContent
  if (tilFiles.length) {
    await getMdxTilListGql()
  }

  // do it for the blog list if we need to as well
  if (bFiles.length) {
    await getMdxBlogListGraphql()
  }

  for (const file of bFiles) {
    if (file.changeType === 'delete') {
      // TODO: delete the cache for this file
      continue
    }

    // refresh the cache in this case
    const justTheSlug = file.filename
      .replace('content/blog', '')
      .replace(/\w+\.mdx?$/, '')
      .replace('/', '')

    await getMdxPageGql({contentDir: 'blog', slug: justTheSlug})
  }

  return json({ok: true})
}
