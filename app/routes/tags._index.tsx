import {MetaFunction, json} from '@remix-run/node'
import {
  NavLink,
  ShouldRevalidateFunctionArgs,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react'
import {H1, H2} from '~/components/typography'
import {getMdxTagListGql} from '~/utils/mdx-utils.server'

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

export const meta: MetaFunction<typeof loader> = () => {
  return [
    {
      title: `Taran "tearing it up" Bains | tags`,
      description: '',
    },
    {
      name: 'description',
      content: 'A list of tags used on this blog',
    },
  ]
}

export async function loader() {
  const allData = await getMdxTagListGql()
  return json({...allData})
}

export default function TagPage() {
  const {tagList} = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  return (
    <div className="mx-auto mt-16 min-h-[100vh] max-w-screen-xl pb-24">
      <div className="ml-[10vw] mr-[10vw] max-w-full xl:mx-auto">
        <H1>Tags</H1>
        <div className="mt-8">
          {tagList.map(([firstLetter, tags]) => {
            return (
              <div key={firstLetter} className="mb-20 last-of-type:mb-0">
                <H2>{firstLetter}</H2>
                <ul className="md:flex md:flex-wrap">
                  {tags.map(tag => {
                    return (
                      <li
                        key={tag.name}
                        className="
                      mb-4 mr-6 
                      first-of-type:ml-0 
                      last-of-type:mr-0 
                      md:mb-0
                      md:ml-6
                      md:first-of-type:ml-6"
                      >
                        <NavLink
                          prefetch="intent"
                          className="font-bold  uppercase text-accent dark:opacity-80"
                          to={`/tags/${tag.name}?${searchParams.toString()}`}
                        >
                          {' '}
                          {`${tag.name} [${tag.value}]`}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
