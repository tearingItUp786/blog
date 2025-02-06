import { useLoaderData } from 'react-router';
import {twJoin} from 'tailwind-merge'
import {Newsletter} from '~/components/newsletter/newsletter'
import {Pill, PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE} from '~/components/pill'
import {H1, H2} from '~/components/typography'
import {getQuote} from '~/utils/quote.server'

export function shouldRevalidate() {
  return false
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
    (<div className="mx-auto my-20 min-h-[81svh] max-w-screen-xl px-4 md:px-20">
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
              follow me on 𝕏
            </a>
          </div>
        </article>
        <div className="mt-24 basis-full text-center lg:basis-2/3 lg:px-24">
          <H2 className="font-normal">{quoteData.quote}</H2>
          <p className="mt-7 text-xl font-normal italic">{quoteData.author}</p>
        </div>
      </div>
      <Newsletter />
    </div>)
  );
}
