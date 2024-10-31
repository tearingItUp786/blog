import {NavLink, useLocation, useSearchParams} from '@remix-run/react'
import clsx from 'clsx'

import {useEffect, useState} from 'react'
import Toggle from '~/components/theme-toggle'
import {twJoin} from 'tailwind-merge'
import {Search} from './search'
import {MobileNav} from './mobile'

const HomeIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none">
      <g clipPath="url(#a)">
        <path
          className="fill-body transition-colors group-hover:fill-accent  dark:group-hover:fill-accent"
          d="M12.505 25.181v-6.82h5.455v6.82c0 .75.614 1.364 1.364 1.364h4.092c.75 0 1.364-.613 1.364-1.364v-9.547H27.1c.627 0 .927-.777.45-1.187L16.147 4.178a1.374 1.374 0 0 0-1.828 0L2.916 14.447c-.463.41-.177 1.187.45 1.187h2.32v9.547c0 .75.613 1.364 1.363 1.364h4.092c.75 0 1.364-.613 1.364-1.364Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.735.688h29v29h-29z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function Navbar() {
  const [searchParams] = useSearchParams()

  const searchParamsWithoutOffset = new URLSearchParams(searchParams)
  // we don't need the offset for the navbar
  searchParamsWithoutOffset.delete('offset')

  const [isOpen, setIsOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false)
    }
  }, [loc])

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add(
        'overflow-hidden',
        'lg:overflow-auto',
      )
      document.body.classList.add('overflow-hidden', 'lg:overflow-auto')
    } else {
      document.documentElement.classList.remove(
        'overflow-hidden',
        'lg:overflow-auto',
      )
      document.body.classList.remove('overflow-hidden', 'lg:overflow-auto')
    }
  }, [isOpen])

  const navClassName =
    'transition-[color] lg:ml-5 sm:pt-0 pl-2 pr-2 text-inverse-body lg:text-body lg:dark:text-off-white lg:text-charcoal-gray lg:bg-transparent duration-300 flex justify-center  hover:!text-pink focus:!text-pink text-body block  text-center text-xl items-center'
  const activeClassName =
    '!text-pink not-italic underline font-display font-normal  dark:lg:bg-gray-100 '
  const setNavClassName = ({isActive}: {isActive: boolean}) => {
    return twJoin(navClassName, isActive ? activeClassName : '')
  }

  return (
    <div className="relative mx-auto flex min-h-[55px] w-full max-w-screen-xl justify-between px-4 pt-8  md:px-20">
      <NavLink
        aria-label="Link to home page"
        prefetch="intent"
        className={`
    normal
    lg:dark:charcoal-gray group flex  items-center justify-center text-center text-xl text-charcoal-gray transition-[color] duration-300  hover:!text-pink  focus:!text-pink  dark:text-off-white  lg:bg-transparent`}
        to={`/?${searchParamsWithoutOffset}`}
      >
        <HomeIcon />
      </NavLink>
      <div
        className={clsx(
          isOpen
            ? 'scale-100 opacity-100'
            : 'lg:h-100vh h-auto scale-0 opacity-0 lg:visible lg:scale-100 lg:opacity-100',
          'fixed left-0 top-[63px] z-20 w-[100vw] origin-top-right justify-center space-y-4 transition-transform lg:relative lg:top-[inherit] lg:flex lg:w-auto lg:space-y-0',
        )}
      >
        <NavLink
          prefetch="intent"
          className={setNavClassName}
          to={`/about?${searchParamsWithoutOffset}`}
        >
          about
        </NavLink>
        <NavLink
          prefetch="intent"
          className={setNavClassName}
          to={`/uses?${searchParamsWithoutOffset}`}
        >
          uses
        </NavLink>
        <NavLink
          prefetch="intent"
          className={setNavClassName}
          to={`/til?${searchParamsWithoutOffset}`}
        >
          TIL
        </NavLink>
        <NavLink
          prefetch="intent"
          className={setNavClassName}
          to={`/blog?${searchParamsWithoutOffset}`}
        >
          blog
        </NavLink>
        <div className="flex w-full items-center justify-center lg:ml-6">
          <Toggle />
        </div>
      </div>

      <div className="relative flex w-[80px] flex-grow items-center justify-end md:pr-0 lg:flex-grow">
        <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />
        <Search />
      </div>
    </div>
  )
}
