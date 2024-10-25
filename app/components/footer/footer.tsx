import {NavLink, useSearchParams} from '@remix-run/react'

export function Footer() {
  const [searchParams] = useSearchParams()
  const searchParamsWithoutOffset = new URLSearchParams(searchParams)
  // we don't need the offset for the navbar
  searchParamsWithoutOffset.delete('offset')

  return (
    <footer className="w-full border-t-[1px] bg-gray-100 px-10 py-6  dark:bg-white lg:px-28">
      <div className="mx-auto block w-full justify-between text-center lg:flex lg:text-left">
        <span className="mb-4 block text-sm text-white dark:text-accent lg:mb-0">
          Taran "tearing it up" Bains
        </span>
        <div className="flex flex-wrap md:block">
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-white underline dark:text-charcoal-gray"
            to={`/til?${searchParamsWithoutOffset}`}
          >
            TIL
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-white underline dark:text-charcoal-gray"
            to={`/about?${searchParamsWithoutOffset}`}
          >
            ABOUT
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-white underline dark:text-charcoal-gray"
            to={`/blog?${searchParamsWithoutOffset}`}
          >
            BLOG
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-white underline dark:text-charcoal-gray"
            to={`/uses?${searchParamsWithoutOffset}`}
          >
            USES
          </NavLink>
        </div>
      </div>
    </footer>
  )
}
