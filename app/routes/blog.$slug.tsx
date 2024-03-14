import {useEffect, useRef} from 'react'
import {useLoaderData, useLocation} from '@remix-run/react'
import type {LoaderFunction, MetaFunction} from '@remix-run/node'
import {json} from '@remix-run/node'
import type {MdxPage} from 'types'
import {LineSvg} from '~/components/blog/line-svg'
import {H1, H4, TextLink} from '~/components/typography'
import {getMdxBlogListGraphql, getMdxPageGql} from '~/utils/mdx-utils.server'
import {dateFormat, invariantResponse} from '~/utils/misc'
import {PreviousAndNextLinks} from '~/components/blog/previous-and-next-links'
import type {ILazyLoadInstance} from 'vanilla-lazyload'
import LazyLoad from 'vanilla-lazyload'
import {useMdxComponent} from '~/utils/mdx-utils'
import * as amplitude from '@amplitude/analytics-browser'

type LoaderData = {
  page: MdxPage
  reqUrl: string
  next?: MdxPage
  prev?: MdxPage
}
export const meta: MetaFunction<typeof loader> = ({data}) => {
  const loaderData = data as LoaderData
  const blogPostTitle =
    loaderData.page.frontmatter?.title ?? 'A single blost post'
  return [{title: `Taran "tearing it up" Bains | Blog | ${blogPostTitle}`}]
}

export const loader: LoaderFunction = async ({params, request}) => {
  invariantResponse(params?.slug, 'No slug provided')

  const urlReq = new URL(request.url)
  const showDrafts = urlReq.searchParams.has('showDrafts')

  try {
    const page = await getMdxPageGql({
      contentDir: 'blog',
      slug: params.slug,
      cachifiedOptions: {
        forceFresh: Boolean(process.env.NODE_ENV !== 'production'),
      },
    })

    if (
      page.frontmatter.draft &&
      process.env.NODE_ENV === 'production' &&
      !showDrafts
    ) {
      throw new Error('Page is a draft')
    }

    const headers = {
      'Cache-Control': 'private, max-age=3600',
      Vary: 'Cookie',
    }

    const {publishedPages, draftPages} = await getMdxBlogListGraphql()
    const blogList =
      process.env.NODE_ENV === 'production' && !showDrafts
        ? publishedPages
        : [...draftPages, ...publishedPages]

    const currentIndex = blogList.findIndex(
      el => el.frontmatter?.title === page?.frontmatter?.title,
    )
    const prev = blogList?.[currentIndex - 1]
    const next = blogList?.[currentIndex + 1]

    const data: LoaderData = {
      page,
      prev,
      next,
      reqUrl: urlReq.origin + urlReq.pathname,
    }
    return json(data, {status: 200, headers})
  } catch (err) {
    throw json({error: params.slug}, {status: 404})
  }
}

const FrontmatterSubtitle = ({date, time}: {date?: string; time?: string}) => {
  if (!date) return null

  return (
    <div
      className='
              relative
              text-lg 
              font-bold
              text-pink 
              after:absolute 
              after:bottom-[-10px] 
              after:left-[50%] 
              after:w-[150px]
              after:translate-x-[-50%] 
              after:border-b-[1px] 
              after:border-gray-300
              after:content-[""]
              dark:opacity-80
              dark:after:border-white
            '
    >
      Taran "tearing it up" Bains • <span>{dateFormat(date)}</span> •{' '}
      <span>{time}</span>
    </div>
  )
}

export default function MdxScreen() {
  const data = useLoaderData<LoaderData>()
  const {code, frontmatter, readTime} = data.page
  const Component = useMdxComponent(String(code))
  const loc = useLocation()
  const lazyLoadRef = useRef<ILazyLoadInstance | null>(null)

  const tweetMessage = `I just read "${
    frontmatter!.title
  }" by @tearingItUp786 \n\n`

  useEffect(() => {
    amplitude.track('Page View', {
      page: data.reqUrl,
      title: frontmatter.title,
    })
    if (lazyLoadRef.current === null) {
      lazyLoadRef.current = new LazyLoad()
    } else {
      lazyLoadRef.current.update()
    }
  }, [loc])

  const previous = data.prev
    ? {to: data.prev.slug, title: data.prev.frontmatter?.title}
    : null
  const next = data.next
    ? {to: data.next.slug, title: data.next.frontmatter?.title}
    : null

  return (
    <div className="relative mx-[10vw] mt-8">
      <PreviousAndNextLinks previous={previous} next={next} />
      <LineSvg tag={frontmatter.tag ?? ''} date={frontmatter.date ?? ''} />
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <div className="col-span-full lg:col-span-8 lg:col-start-3">
          <H1>{frontmatter.title}</H1>
          {frontmatter.subtitle ? (
            <H4 variant="secondary" className="mb-4 leading-tight">
              {frontmatter.subtitle}
            </H4>
          ) : null}
          <FrontmatterSubtitle time={readTime?.text} date={frontmatter.date} />
        </div>
      </div>

      <main
        className="prose 
        prose-light 
        relative 
        mx-auto 
        mb-10 
        grid 
        max-w-7xl grid-cols-4 
        gap-x-4 
        break-words
        dark:prose-dark md:grid-cols-8 lg:grid-cols-12 lg:gap-x-6"
      >
        <Component />
        <div className="border-sold mt-8 block border-t-[1px] pb-4 pt-8 md:flex md:justify-between">
          <TextLink
            className="mb-2 block md:mb-0"
            href={`https://twitter.com/intent/tweet?${new URLSearchParams({
              url: data.reqUrl,
              text: tweetMessage,
            })}`}
          >
            Post about this
          </TextLink>
          <TextLink
            className="block"
            href={`https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams(
              {
                url: data.reqUrl,
              },
            )}`}
          >
            Share on LinkedIn
          </TextLink>
        </div>
      </main>
    </div>
  )
}
