import {NavLink, useSearchParams} from '@remix-run/react'

export function Footer() {
  const [searchParams] = useSearchParams()
  return (
    <footer className="w-full border-t-[1px] bg-gray-100 px-10 py-6  dark:bg-white lg:px-28">
      <div className="mx-auto block w-full justify-between text-center lg:flex lg:text-left">
        <span className="mb-4 block text-sm text-white dark:text-accent lg:mb-0">
          Taran "tearing it up" Bains
        </span>
        <div className="flex flex-wrap md:block">
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-white underline dark:text-gray-300"
            to={'/til?' + searchParams.toString()}
          >
            TIL
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-white underline dark:text-gray-300"
            to={'/about?' + searchParams.toString()}
          >
            ABOUT
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-white underline dark:text-gray-300"
            to={'/blog?' + searchParams.toString()}
          >
            BLOG
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-white underline dark:text-gray-300"
            to={'/uses' + searchParams.toString()}
          >
            USES
          </NavLink>
        </div>
      </div>
    </footer>
  )
}
