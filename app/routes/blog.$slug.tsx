import {CatchBoundaryComponent, useCatch, useLoaderData} from '@remix-run/react'
import type {LoaderFunction, MetaFunction} from '@remix-run/node'
import {json} from '@remix-run/node'
import type {MdxPage} from 'types'
import {LineSvg} from '~/components/blog/line-svg'
import {H1, H3, H4} from '~/components/typography'
import {getMdxPageGql, useMdxComponent} from '~/utils/mdx'
import {dateFormat} from '~/utils/misc'

type LoaderData = {
  page: MdxPage
}
export const meta: MetaFunction = ({params}) => {
  return {title: `Taran "tearing it up" Bains | Blog | ${params.slug}`}
}

export const CatchBoundary = () => {
  const catchBoundary = useCatch()
  return (
    <div className="flex  h-[calc(95vh_-_63.5px)] items-center bg-white dark:bg-gray-100">
      <div className="mx-auto flex max-w-[500px] flex-wrap items-center justify-center overflow-hidden">
        <H3>Not found: {catchBoundary?.status}</H3>
        <iframe
          src="https://giphy.com/embed/UHAYP0FxJOmFBuOiC2"
          width="480"
          height="361"
          className="giphy-embed"
          allowFullScreen
        />

        <p className="text-pink">
          <a
            className="text-pink"
            href="https://giphy.com/gifs/gengar-jijidraws-jiji-knight-UHAYP0FxJOmFBuOiC2"
          >
            via GIPHY
          </a>
        </p>
      </div>
    </div>
  )
}

export const loader: LoaderFunction = async ({params}) => {
  if (!params.slug) {
    throw new Error('params.slug is not defined')
  }

  try {
    const page = await getMdxPageGql({
      contentDir: 'blog',
      slug: params.slug,
    })

    if (page.frontmatter.draft) {
      throw new Error('Page is a draft')
    }

    const headers = {
      'Cache-Control': 'private, max-age=3600',
      Vary: 'Cookie',
    }

    const data: LoaderData = {page}
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
              font-medium
              text-pink 
              after:absolute 
              after:left-[50%] 
              after:bottom-[-10px] 
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

  return (
    <div className="relative mx-[10vw] mt-8">
      <LineSvg tag={frontmatter.tag ?? ''} date={frontmatter.date ?? ''} />
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <div className="col-span-full lg:col-span-8 lg:col-start-3">
          <H1>{frontmatter.title}</H1>
          {frontmatter.description ? (
            <H4 variant="secondary" className="mb-1 leading-tight">
              {frontmatter.description}
            </H4>
          ) : null}
          <FrontmatterSubtitle time={readTime?.text} date={frontmatter.date} />
        </div>
      </div>

      <main
        // className='max-w-screen-lg mx-auto prose prose-light dark:prose-dark'
        className="prose 
        prose-light 
        relative 
        mx-auto 
        mb-10 
        grid 
        max-w-7xl grid-cols-4 
        gap-x-4 
        break-words pb-8 
        dark:prose-dark md:grid-cols-8 lg:grid-cols-12 lg:gap-x-6"
      >
        <Component />
      </main>
    </div>
  )
}
