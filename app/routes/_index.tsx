import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
  useLoaderData,
  type ShouldRevalidateFunctionArgs,
} from '@remix-run/react'
import {HomepageHero} from '~/components/homepage-hero'
import {H1, H2} from '~/components/typography'

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

export const loader = ({request}: LoaderFunctionArgs) => {
  let searchParams = new URLSearchParams(request.url.split('?')[1])
  // new animation param
  let animation = searchParams.get('animation')
  return json({animation})
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  if (data.animation !== null) {
    return (
      <div
        className="
        dark: 
        relative 
        h-[100vh]
        overflow-hidden 
        bg-gradient-to-br
        from-[#9E7ABE]
        to-[#8278B7]
        to-[60%]
        bg-contain
        bg-fixed
        bg-no-repeat
        text-center dark:from-[#35356B] dark:to-[#2F1A43]
      "
      >
        <HomepageHero />
      </div>
    )
  }

  return (
    <div>
      <div
        className={`
      relative
      h-[calc(95vh_-_63.5px)]
      overflow-hidden
      bg-contain
      bg-fixed
      bg-no-repeat
      text-center
     `}
      >
        <article className="absolute left-[50%] top-[50%] z-[2] translate-x-[-50%] translate-y-[-60%]">
          <H1 className="text-body whitespace-nowrap text-[2.6rem] uppercase leading-[1.1] md:text-[5.2rem]">
            Taran Bains
          </H1>
          <H2 className="bg-gray-100 px-2 text-center text-[1.5rem] uppercase leading-tight text-white dark:bg-accent md:text-[3.5rem]">
            Tearing it up
          </H2>
          <H1 className="text-body whitespace-nowrap text-[1.25rem] uppercase leading-[1.5] md:text-[2.5rem]">
            Like his life depends on it
          </H1>
        </article>
      </div>
    </div>
  )
}
