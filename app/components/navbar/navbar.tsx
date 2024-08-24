import {NavLink, useLocation, useSearchParams} from '@remix-run/react'
import clsx from 'clsx'

import {useEffect, useState} from 'react'
import {twJoin} from 'tailwind-merge'
import {Search} from './search'
import {MobileNav} from './mobile'

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
    'transition-[color] dark:text-white bg-white dark:bg-gray-100 lg:dark:text-gray-300 lg:text-white lg:bg-transparent duration-300 flex justify-center pt-[5px] hover:!text-pink focus:!text-pink text-body block min-w-[150px] text-center  text-lg italic items-center'
  const activeClassName =
    '!text-pink not-italic font-display font-normal bg-white lg:bg-white dark:lg:bg-gray-100 dark:bg-gray-100'
  const setNavClassName = ({isActive}: {isActive: boolean}) => {
    return twJoin(navClassName, isActive ? activeClassName : 'lg:dark:bg-white')
  }

  return (
    <div className="relative flex min-h-[55px] w-full bg-gray-100 px-9 dark:bg-white">
      <NavLink
        prefetch="intent"
        className={`
    normal text-body flex min-w-[150px] items-center justify-center  text-center text-xl text-white transition-[color] duration-300  hover:!text-pink  focus:!text-pink  dark:text-black lg:bg-transparent lg:text-white lg:dark:text-gray-300
          `}
        to={`/?${searchParamsWithoutOffset}`}
      >
        Taran Bains
      </NavLink>
      <div
        className={clsx(
          isOpen
            ? 'scale-100 opacity-100'
            : 'lg:h-100vh h-auto scale-0 opacity-0 lg:visible lg:scale-100 lg:opacity-100',
          'fixed left-0 top-[63px] z-20 w-[100vw] flex-grow origin-top-right justify-center transition-transform lg:relative lg:top-[inherit] lg:flex lg:w-auto',
        )}
      >
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
          BLOG
        </NavLink>
        <NavLink
          prefetch="intent"
          className={setNavClassName}
          to={`/about?${searchParamsWithoutOffset}`}
        >
          ABOUT
        </NavLink>
        <NavLink
          prefetch="intent"
          className={setNavClassName}
          to={`/uses?${searchParamsWithoutOffset}`}
        >
          USES
        </NavLink>
      </div>

      <div className="relative flex w-[80px] flex-grow items-center justify-end md:pr-0 lg:flex-grow-0">
        <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />
        <Search />
      </div>
    </div>
  )
}
