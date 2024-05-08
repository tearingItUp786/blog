import * as amplitude from '@amplitude/analytics-browser'
import type {LoaderFunctionArgs, MetaFunction} from '@remix-run/node'
import {json} from '@remix-run/node'
import {
  ShouldRevalidateFunctionArgs,
  useLoaderData,
  useLocation,
  useSearchParams,
} from '@remix-run/react'
import {useEffect, useRef} from 'react'
import type {ExternalScriptsHandle} from 'remix-utils/external-scripts'
import type {MdxPage} from 'types'
import type {ILazyLoadInstance} from 'vanilla-lazyload'
import LazyLoad from 'vanilla-lazyload'
import {H1, H4, TextLink} from '~/components/typography'
import {useMdxComponent} from '~/utils/mdx-utils'
import {getMdxBlogListGraphql, getMdxPageGql} from '~/utils/mdx-utils.server'
import {dateFormat, invariantResponse} from '~/utils/misc'
import {LineSvg} from './line-svg'
import {PreviousAndNextLinks} from './previous-and-next-links'

type LoaderData = {
  page: MdxPage
  reqUrl: string
  next?: MdxPage
  prev?: MdxPage
  hasTwitterEmbed?: boolean
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  const loaderData = data as LoaderData
  const blogPostTitle =
    loaderData.page.frontmatter?.title ?? 'A single blost post'
  return [
    {
      title: `Taran "tearing it up" Bains | Blog | ${blogPostTitle}`,
    },
    {
      name: 'description',
      content:
        loaderData.page.frontmatter?.description ??
        'A blog post by Taran Bains',
    },
  ]
}

export let handle: ExternalScriptsHandle<LoaderData> = {
  scripts({data}) {
    let externalScripts = []

    if (data?.hasTwitterEmbed) {
      externalScripts.push({
        src: 'https://platform.twitter.com/widgets.js',
        async: true,
      })
    }

    return externalScripts
  },
}

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) {
    return false
  }

  return defaultShouldRevalidate
}

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  invariantResponse(params?.slug, 'No slug provided')

  const urlReq = new URL(request.url)
  const showDrafts = urlReq.searchParams.has('showDrafts')

  try {
    const page = await getMdxPageGql({
      contentDir: 'blog',
      slug: params.slug,
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

    // If the content of the page contains a twitter status link, load the twitter widget script
    const twitterStatusRegex = new RegExp(
      'https://twitter\\.com/([a-zA-Z0-9_]+)/status/(\\d+)',
      'i',
    )
    const data: LoaderData = {
      page,
      prev,
      next,
      reqUrl: urlReq.origin + urlReq.pathname,
      hasTwitterEmbed: twitterStatusRegex.test(String(page?.matter?.content)),
    }

    return json(data, {status: 200, headers})
  } catch (err) {
    throw json({error: params.slug, data: {page: null}}, {status: 404})
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

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load?: () => void
      }
    }
  }
}

export default function MdxScreen() {
  const data = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
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

    if (data.hasTwitterEmbed && window.twttr) {
      // pulled from: https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-loading-and-initialization
      window?.twttr?.widgets?.load?.()
    }
  }, [loc])

  const previous = data.prev
    ? {
        to: data.prev.slug + `?${searchParams.toString()}`,
        title: data.prev.frontmatter?.title,
      }
    : null
  const next = data.next
    ? {
        to: data.next.slug + `?${searchParams.toString()}`,
        title: data.next.frontmatter?.title,
      }
    : null

  return (
    <div className="relative mx-[10vw] mt-8">
      <PreviousAndNextLinks
        className="hidden md:flex"
        previous={previous}
        next={next}
      />
      <LineSvg tag={frontmatter.tag ?? ''} date={frontmatter.date ?? ''} />
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <div className="col-span-full lg:col-span-8 lg:col-start-3">
          <H1>{frontmatter.title}</H1>
          {frontmatter.subtitle ? (
            <H4 As="h2" variant="secondary" className="mb-4 leading-tight">
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
        grid
        max-w-7xl 
        grid-cols-4 gap-x-4 
        break-words 
        dark:prose-dark
        md:mb-12 md:grid-cols-8 lg:grid-cols-12 lg:gap-x-6"
      >
        <Component />
        <div className="border-sold mt-8 flex justify-between border-t-[1px] pb-4 pt-8">
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
            className="block text-right"
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
      <div className="relative">
        <PreviousAndNextLinks
          className="mb-12 mt-4 flex md:hidden"
          previous={previous}
          next={next}
        />
      </div>
    </div>
  )
}
