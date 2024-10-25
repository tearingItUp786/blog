import {type ShouldRevalidateFunctionArgs} from '@remix-run/react'
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

export default function Index() {
  return (
    <div>
      <div
        className={`
      relative
      h-[calc(95svh_-_63.5px)]
      text-center
     `}
      >
        <article className="absolute left-[50%] top-[50%] z-[2] translate-x-[-50%] translate-y-[-60%]">
          <H1 className="whitespace-nowrap text-[2.6rem] uppercase leading-[1.1] text-body md:text-[5.2rem]">
            Taran Bains
          </H1>
          <H2 className="bg-gray-100 px-2 text-center text-[1.5rem] uppercase leading-tight text-white dark:bg-accent md:text-[3.5rem]">
            Tearing it up
          </H2>
          <H1 className="whitespace-nowrap text-[1.25rem] uppercase leading-[1.5] text-body md:text-[2.5rem]">
            Like his life depends on it
          </H1>
        </article>
      </div>
    </div>
  )
}
