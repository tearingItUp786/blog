import {json} from '@remix-run/node'
import {type ShouldRevalidateFunctionArgs} from '@remix-run/react'
import {HomepageHero} from '~/components/homepage-hero'

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

export function loader() {
  return json(
    {},
    {
      status: 200,
      headers: {
        // cache for one week
        'Cache-Control': 'public, max-age=604800, s-maxage=604800',
      },
    },
  )
}

export default function Index() {
  return (
    <div
      className="
        dark: 
        relative 
        h-[100dvh]
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
