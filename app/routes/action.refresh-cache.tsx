import type {ActionFunction} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import type {MdxPage} from 'types'
import {
  delMdxPageGql,
  getMdxBlogListGraphql,
  getMdxIndividualTagGql,
  getMdxPageGql,
  getMdxTagListGql,
  getMdxTilListGql,
} from '~/utils/mdx'
import {redisClient} from '~/utils/redis.server'
import {algoliaClient} from '~/utils/algolia.server'

type File = {
  changeType: 'modified' | 'added' | 'deleted' | 'moved'
  filename: string
}
type Body = {contentFiles: Array<File>}

const cachifiedOptions = {
  cachifiedOptions: {forceFresh: true},
}

const getFileArray = (acc: [File[], File[]], file: File) => {
  if (file.filename.startsWith('content/blog')) {
    acc[0].push(file)
  } else if (file.filename.startsWith('content/til')) {
    acc[1].push(file)
  }
  return acc
}

const index = algoliaClient.initIndex('website')

export const action: ActionFunction = async ({request}) => {
  if (request.headers.get('auth') !== process.env.REFRESH_CACHE_SECRET) {
    // hahaha
    return redirect('https://youtu.be/VM3uXu1Dq4c')
  }

  const forceFresh = request.headers.get('x-force-fresh') === 'true'

  const {contentFiles} = (await request.json()) as Body

  if (!contentFiles) {
    return json({ok: false})
  }

  const [bFiles, tilFiles] = contentFiles.reduce(getFileArray, [[], []])
  let blogList: Omit<MdxPage, 'code'>[] = []
  let tilList: MdxPage[] = []

  // refresh til list, blog list, all blog articles, tag list, and  tags
  if (forceFresh) {
    console.log('⚡️ Manually force fresh invoked!')
    const individualBlogArticles = await redisClient.keys('gql:blog:[0-9]*')

    tilList = await getMdxTilListGql({...cachifiedOptions})
    blogList = (await getMdxBlogListGraphql({...cachifiedOptions}))
      .publishedPages

    const {tags} = await getMdxTagListGql({...cachifiedOptions})

    await Promise.all(
      tags.map(
        async tag =>
          await getMdxIndividualTagGql({
            userProvidedTag: tag,
            ...cachifiedOptions,
          }),
      ),
    )

    await Promise.all(
      individualBlogArticles.map(async article => {
        const [, contentDir, slug] = article.split(':')
        if (contentDir && slug) {
          return await getMdxPageGql({
            contentDir,
            slug,
            ...cachifiedOptions,
          })
        }
      }),
    )

    console.log('👍 refreshing algolia')
    const blogObjects = [...blogList].map(o => ({
      ...o.matter,
      type: 'blog',
      objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
      content: o?.matter?.content?.replace(/(<([^>]+)>)/gi, ''), // strip out the html tags from the content -- this could be better but it fits my needs
    }))

    const tilObjects = [...tilList].map(o => ({
      ...o.matter,
      type: 'til',
      objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
      content: o?.matter?.content?.replace(/(<([^>]+)>)/gi, ''), // strip out the html tags from the content -- this could be better but it fits my needs
    }))
    await index.replaceAllObjects([...blogObjects, ...tilObjects])
    console.log('👍 refreshed algolia index with til list')

    return json({ok: true})
  }

  // if we edited a content file, call the fetcher function for getContent
  if (tilFiles.length) {
    console.log('👍 refreshing til list')
    tilList = await getMdxTilListGql({...cachifiedOptions})
  }

  // we want to delete and refresh the individual files
  // before we go and refresh the list
  for (const file of bFiles) {
    // refresh the cache in this case
    const slug = file.filename
      .replace('content/blog', '')
      .replace(/\w+\.mdx?$/, '')
      .replace(/\//g, '')

    const args = {
      contentDir: 'blog',
      slug,
      ...cachifiedOptions,
    }

    if (
      file.changeType === 'deleted' ||
      file.changeType === 'modified' ||
      file.changeType === 'moved'
    ) {
      console.log('❌ delete', slug, 'from redis and algolia')
      await delMdxPageGql(args)

      const recordToDelete = await index.getObject(`${slug}`)

      if (recordToDelete) {
        await index.deleteObject(slug)
      }
      continue
    }

    console.log('👍 refresh ', slug, 'from redis')
    await getMdxPageGql(args)
  }

  // do it for the blog list if we need to as well
  if (bFiles.length) {
    console.log('👍 refreshing published blog list')
    const {publishedPages} = await getMdxBlogListGraphql({...cachifiedOptions})
    blogList = publishedPages
  }

  console.log('👍 refresh tag list in redis')
  const {tags} = await getMdxTagListGql({...cachifiedOptions})

  console.log('👍 refresh the individual tags in redis')
  await Promise.all(
    tags.map(
      async tag =>
        await getMdxIndividualTagGql({
          userProvidedTag: tag,
          ...cachifiedOptions,
        }),
    ),
  )

  if (blogList.length || tilList.length) {
    const blogObjects = [...blogList].map(o => ({
      ...o.matter,
      type: 'blog',
      objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
      content: o?.matter?.content?.replace(/(<([^>]+)>)/gi, ''), // strip out the html tags from the content -- this could be better but it fits my needs
    }))

    const tilObjects = [...tilList].map(o => ({
      ...o.matter,
      type: 'til',
      objectID: `${o?.slug}`, // create our own object id so when we upload to algolia, there's no duplicates
      content: o?.matter?.content?.replace(/(<([^>]+)>)/gi, ''), // strip out the html tags from the content -- this could be better but it fits my needs
    }))
    await index.saveObjects([...blogObjects, ...tilObjects])
  }
  console.log('👍 refreshed algolia index with til list')
  // refresh all the redis tags as well
  return json({ok: true})
}
