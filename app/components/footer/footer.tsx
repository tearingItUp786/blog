import { NavLink } from "@remix-run/react";

export function Footer() {
  return (
    <footer className="px-10 border-t-[1px] lg:px-28 py-6 w-full  bg-gray-100 dark:bg-white">
      <div className="mx-auto text-center lg:text-left w-full block lg:flex justify-between">
        <span className="mb-4 block lg:mb-0 text-sm text-white dark:text-accent">
          Taran "tearing it up" Bains
        </span>
        <div className="block">
          <NavLink
            className="px-8 text-sm text-white underline dark:text-gray-300"
            to="/til"
          >
            TIL
          </NavLink>
          <NavLink
            className="px-8 text-sm text-white underline dark:text-gray-300"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            className="px-8 text-sm text-white underline dark:text-gray-300"
            to="/blog"
          >
            BLOG
          </NavLink>
        </div>
      </div>
    </footer>
  );
}
