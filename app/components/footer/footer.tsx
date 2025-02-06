import { NavLink, useSearchParams } from 'react-router';

export function Footer() {
  const [searchParams] = useSearchParams()
  const searchParamsWithoutOffset = new URLSearchParams(searchParams)
  // we don't need the offset for the navbar
  searchParamsWithoutOffset.delete('offset')

  return (
    <footer className="w-full  border-t-[1px] border-body  px-4  py-6 ">
      <div className="mx-auto block w-full max-w-screen-xl justify-between text-center md:px-20 lg:flex lg:text-left">
        <span className="mb-4 block text-sm text-body dark:text-accent lg:mb-0">
          Taran "tearing it up" Bains
        </span>
        <div className="flex flex-wrap md:block">
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-body underline "
            to={`/til?${searchParamsWithoutOffset}`}
          >
            TIL
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-body underline"
            to={`/about?${searchParamsWithoutOffset}`}
          >
            ABOUT
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-body underline "
            to={`/blog?${searchParamsWithoutOffset}`}
          >
            BLOG
          </NavLink>
          <NavLink
            prefetch="intent"
            className="basis-6/12 px-8 text-sm text-body underline"
            to={`/uses?${searchParamsWithoutOffset}`}
          >
            USES
          </NavLink>
        </div>
      </div>
    </footer>
  )
}
