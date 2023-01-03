import { json, LoaderFunction, NavLink, useCatch, useLoaderData } from 'remix'
import type { MdxPage } from 'types'
import { LineSvg } from '~/components/blog/line-svg'
import { H1, H4 } from '~/components/typography'
import { getMdxPage, useMdxComponent } from '~/utils/mdx'
import { dateFormat } from '~/utils/misc'

type LoaderData = {
  page: MdxPage
}

export const loader: LoaderFunction = async ({ params, request }) => {
  if (!params.slug) {
    throw new Error('params.slug is not defined')
  }
  const page = await getMdxPage({
    contentDir: 'blog',
    slug: params.slug,
  }).catch(() => null)

  const headers = {
    'Cache-Control': 'private, max-age=3600',
    Vary: 'Cookie',
  }

  console.log('test', page)
  if (!page) {
    throw json({ error: true }, { status: 404, headers })
  }
  const data: LoaderData = { page }
  return json(data, { status: 200, headers })
}

const FrontmatterSubtitle = ({ date }: { date?: string }) => {
  if (!date) return null

  return (
    <div
      className='
              relative
              text-pink 
              font-medium 
              text-lg 
              after:translate-x-[-50%] 
              after:absolute 
              after:content-[""]
              after:w-[150px] 
              after:left-[50%] 
              after:bottom-[-10px]
              after:border-b-[1px]
              after:border-gray-300
              dark:after:border-white
            '
    >
      Taran "tearing it up" Bains • <span>{dateFormat(date)}</span>
    </div>
  )
}

export default function MdxScreen() {
  const data = useLoaderData<LoaderData>()
  const { code, frontmatter } = data.page
  const Component = useMdxComponent(String(code))

  return (
    <div className='relative mx-[10vw] mt-8'>
      <LineSvg tag={frontmatter.tag ?? ''} date={frontmatter.date ?? ''} />
      <div className='mb-12 mx-auto max-w-4xl text-center'>
        <div className='col-span-full lg:col-span-8 lg:col-start-3'>
          <H1>{frontmatter.title}</H1>
          {frontmatter.description ? (
            <H4 variant='secondary' className='mb-1 leading-tight'>
              {frontmatter.description}
            </H4>
          ) : null}
          <FrontmatterSubtitle date={frontmatter.date} />
        </div>
      </div>

      <main
        // className='max-w-screen-lg mx-auto prose prose-light dark:prose-dark'
        className='relative grid grid-cols-4 gap-x-4 md:grid-cols-8 lg:grid-cols-12 lg:gap-x-6 mx-auto max-w-7xl prose prose-light mb-24 break-words dark:prose-dark'
      >
        <Component />
      </main>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  console.error('CatchBoundary', caught)
  return <div>Fucked up </div>
}
