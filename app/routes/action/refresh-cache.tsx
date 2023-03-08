import {ActionFunction, json, redirect} from '@remix-run/node'
import {getMdxBlogListGraphql, getMdxTilListGql} from '~/utils/mdx'

type Body = {contentFiles: Array<{changeTypes: string; filename: string}>}

export const action: ActionFunction = async ({request}) => {
  if (request.headers.get('auth') !== process.env.REFRESH_CACHE_SECRET) {
    return redirect('https://youtu.be/VM3uXu1Dq4c')
  }

  const {contentFiles} = (await request.json()) as Body

  if (!contentFiles) {
    return json({ok: false})
  }

  // if we edited a content file, call the fetcher function for getContent
  if (contentFiles.some(file => file.filename.startsWith('content/til/'))) {
    await getMdxTilListGql()
  }

  if (contentFiles.some(file => file.filename.startsWith('content/blog/'))) {
    await getMdxBlogListGraphql()
  }
}
