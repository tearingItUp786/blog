import {NavLink, useLocation} from '@remix-run/react'
import clsx from 'clsx'
import {Logo} from './logo'

import {MobileNav} from './mobile'
import {useEffect, useState} from 'react'
import {Search} from './Search'

export function Navbar() {
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
    'transition-[color] dark:text-white bg-white dark:bg-gray-100 lg:dark:text-gray-300 lg:text-white lg:bg-transparent duration-300 flex justify-center pt-[5px] hover:!text-pink focus:!text-pink text-body block min-w-[150px] text-center  text-xl italic font-light items-center'
  const activeClassName =
    '!text-pink font-display not-italic font-bold bg-white lg:bg-white dark:lg:bg-gray-100 dark:bg-gray-100'
  const setNavClassName = ({isActive}: {isActive: boolean}) => {
    return clsx(navClassName, isActive ? activeClassName : 'lg:dark:bg-white')
  }

  return (
    <div className="relative flex w-full bg-gray-100 px-9 dark:bg-white">
      <div className="mr-[15px] w-[50px] px-0 md:w-[72px]  md:pr-6">
        <NavLink prefetch="intent" className="logoNavLink" to="/">
          <Logo className="py-1" />
        </NavLink>
      </div>
      <div
        className={clsx(
          isOpen
            ? 'scale-100 opacity-100'
            : 'lg:h-100vh h-auto scale-0 opacity-0 lg:visible lg:scale-100 lg:opacity-100',
          'fixed left-0 top-[63px] z-20 w-[100vw] flex-grow origin-top-right justify-center transition-transform lg:relative lg:top-[inherit] lg:flex lg:w-auto',
        )}
      >
        <NavLink prefetch="intent" className={setNavClassName} to="/til">
          TIL
        </NavLink>
        <NavLink prefetch="intent" className={setNavClassName} to="/blog">
          BLOG
        </NavLink>
        <NavLink prefetch="intent" className={setNavClassName} to="/about">
          ABOUT
        </NavLink>
      </div>

      <div className="relative flex w-[80px] flex-grow items-center justify-end md:pr-0 lg:flex-grow-0">
        <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />
        <Search />
      </div>
    </div>
  )
}
