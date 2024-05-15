import type {ShouldRevalidateFunctionArgs} from '@remix-run/react'
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

// dark mode
// #35356B
// #2F1A43

// light mode
// #9E7ABE
// #8278B7
export default function Index() {
  return (
    <div
      className="
        dark: 
        relative 
        h-[calc(95vh_-_63.5px)]
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
