import type {LoaderFunctionArgs, MetaFunction} from '@remix-run/node'
import {json} from '@remix-run/node'
import {ShouldRevalidateFunctionArgs, useLoaderData} from '@remix-run/react'
import {H1, H4} from '~/components/typography'
import {useMdxComponent} from '~/utils/mdx-utils'
import {getMdxPageGql} from '~/utils/mdx-utils.server'
import {invariantResponse} from '~/utils/misc'

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  console.log('wtf', currentUrl.pathname, nextUrl.pathname)
  if (currentUrl.pathname === nextUrl.pathname) {
    return false
  }

  return defaultShouldRevalidate
}

export const meta: MetaFunction<typeof loader> = () => {
  return [
    {
      title: `Taran "tearing it up" Bains | What I use`,
    },
    {
      name: 'description',
      content: `A list of tools and services I use in my day-to-day life`,
    },
  ]
}

export const loader = async ({params}: LoaderFunctionArgs) => {
  invariantResponse(params?.page, 'No slug provided')

  try {
    let page = await getMdxPageGql({
      contentDir: 'pages',
      slug: params.page,
    })

    return json({page})
  } catch (err) {
    throw json({error: params.slug}, {status: 404})
  }
}

export default function Page() {
  let data = useLoaderData<typeof loader>()
  let {code, frontmatter} = data.page
  let Component = useMdxComponent(String(code))

  return (
    <div className="mx-auto mt-16 min-h-[100vh] max-w-screen-xl pb-24">
      <div className="ml-[10vw] mr-[10vw] mt-4 max-w-full xl:mx-[4vw]">
        <main
          className="prose 
        prose-light 
        relative 
        mx-auto 
        mb-10 
        max-w-7xl grid-cols-4 
        break-words
        dark:prose-dark"
        >
          <H1>{frontmatter.title}</H1>
          {frontmatter.subtitle ? (
            <H4 As="h2" variant="secondary" className="mb-4 leading-tight">
              {frontmatter.subtitle}
            </H4>
          ) : null}
          <Component />
        </main>
      </div>
    </div>
  )
}
