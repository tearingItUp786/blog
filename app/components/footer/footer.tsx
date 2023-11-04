import {NavLink} from '@remix-run/react'

export function Footer() {
  return (
    <footer className="w-full border-t-[1px] bg-gray-100 px-10 py-6  dark:bg-white lg:px-28">
      <div className="mx-auto block w-full justify-between text-center lg:flex lg:text-left">
        <span className="mb-4 block text-sm text-white dark:text-accent lg:mb-0">
          Taran "tearing it up" Bains
        </span>
        <div className="block">
          <NavLink
            prefetch="intent"
            className="px-8 text-sm text-white underline dark:text-gray-300"
            to="/til"
          >
            TIL
          </NavLink>
          <NavLink
            prefetch="intent"
            className="px-8 text-sm text-white underline dark:text-gray-300"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            prefetch="intent"
            className="px-8 text-sm text-white underline dark:text-gray-300"
            to="/blog"
          >
            BLOG
          </NavLink>
        </div>
      </div>
    </footer>
  )
}
