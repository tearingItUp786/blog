import {
  useLoaderData,
  type ShouldRevalidateFunctionArgs,
} from '@remix-run/react'
import {twJoin} from 'tailwind-merge'
import {Pill, PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE} from '~/components/pill'
import {H1, H2} from '~/components/typography'
import {getQuote} from '~/utils/quote.server'

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

export async function loader() {
  let count = Math.floor(Math.random() * 5) + 1
  let quoteData = await getQuote({count})
  return {
    quoteData,
    count,
  }
}

export default function Index() {
  const {quoteData} = useLoaderData<typeof loader>()

  return (
    // we can get rid of the svh when we actually have the newsletter
    <div className="mx-auto my-20 min-h-[71svh] max-w-screen-xl px-4 md:px-20">
      <div className="flex flex-wrap justify-between">
        <article className="basis-full  lg:basis-1/3 ">
          <H1 className="mb-6 text-center lg:text-left">Taran Bains</H1>
          <div className="flex flex-wrap justify-center gap-[100%] space-y-5 lg:block">
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
                PILL_CLASS_NAME_ACTIVE,
                'py-[6px] text-lg leading-6',
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
        <div className="mt-24 basis-full text-center lg:basis-2/3 lg:px-24">
          <H2 className="font-normal">{quoteData.quote}</H2>
          <p className="mt-7 text-xl font-normal italic">{quoteData.author}</p>
        </div>
      </div>
    </div>
  )
}
