import {type ShouldRevalidateFunctionArgs} from '@remix-run/react'
import {twJoin} from 'tailwind-merge'
import {Pill, PILL_CLASS_NAME} from '~/components/pill'
import {H1} from '~/components/typography'

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
    <div className="mx-auto mt-20 max-w-screen-xl px-4 md:px-20">
      <div className="flex justify-between">
        <article>
          <H1 className="mb-6">Taran Bains</H1>
          <div className="space-y-5">
            <Pill>software engineer</Pill>
            <Pill>vancouver, bc</Pill>
            <Pill>7+ years experience</Pill>
            <Pill>self-taught</Pill>
            <Pill>full-stack developer</Pill>
            <Pill>typescript</Pill>
            <Pill>go</Pill>
            <a
              href="https://x.com/tearingItUp786"
              target="_blank"
              rel="noreferrer"
              className={twJoin(
                PILL_CLASS_NAME,
                'hover:bg-accent hover:text-charcoal-gray group-hover:text-charcoal-gray',
              )}
            >
              follow me on{' '}
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="ml-2 block h-4 w-4 fill-accent group-hover:fill-charcoal-gray"
              >
                <g>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </g>
              </svg>{' '}
            </a>
          </div>
        </article>
        <div>Something</div>
      </div>
    </div>
  )
}
