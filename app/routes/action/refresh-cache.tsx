import {ActionFunction, json, redirect} from '@remix-run/node'
import {
  delMdxPageGql,
  getMdxBlogListGraphql,
  getMdxIndividualTagGql,
  getMdxPageGql,
  getMdxTagListGql,
  getMdxTilListGql,
} from '~/utils/mdx'
import {delRedisKey, redisClient} from '~/utils/redis.server'

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
    console.log('👍 refreshing til list')
    await delRedisKey('gql:til:list')
    await getMdxTilListGql()
  }

  // do it for the blog list if we need to as well
  if (bFiles.length) {
    console.log('👍 refreshing blog list')
    await delRedisKey('gql:blog:list')
    await getMdxBlogListGraphql()
  }

  for (const file of bFiles) {
    // refresh the cache in this case
    const slug = file.filename
      .replace('content/blog', '')
      .replace(/\w+\.mdx?$/, '')
      .replace('/', '')

    const args = {
      contentDir: 'blog',
      slug,
    }

    if (file.changeType === 'delete') {
      console.log('❌ delete', slug, 'from redis')
      await delMdxPageGql(args)
      continue
    }

    console.log('👍 refresh ', slug, 'from redis')
    await getMdxPageGql(args)
  }

  console.log('🗑️ remove taglist form redis')
  await delRedisKey('gql:tag:list')

  console.log('👍 refresh tag list in redis')
  const {tags} = await getMdxTagListGql()

  // this needs to be synchronous
  for (const tag of tags) {
    await delRedisKey(`gql:tag:${tag}`)
  }

  console.log('keys in redis are', await redisClient.keys('*'))

  console.log('👍 refresh the individual tags in redis')
  await Promise.all(tags.map(async tag => await getMdxIndividualTagGql(tag)))

  console.log('👍 refresh all the redis tags as well')
  // refresh all the redis tags as well
  return json({ok: true})
}
