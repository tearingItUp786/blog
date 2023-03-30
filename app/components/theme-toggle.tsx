import clsx from 'clsx'
import {useEffect, useState} from 'react'
import {Theme, useTheme} from '~/utils/theme-provider'

const ThemeToggle = () => {
  const [, setTheme] = useTheme()
  const [isFooterVisible, setIsFooterVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cb: IntersectionObserverCallback = entries => {
        if (entries?.[0]?.isIntersecting) {
          setIsFooterVisible(true)
        } else {
          setIsFooterVisible(false)
        }
      }
      const observer = new IntersectionObserver(cb, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      })

      let footer = document.getElementsByTagName('footer')[0]
      if (footer) {
        observer.observe(footer)
      }

      return () => {
        if (footer) {
          observer.unobserve(footer)
        }
      }
    }
  }, [])

  return (
    <>
      <div
        className={clsx(
          isFooterVisible ? 'absolute bottom-32 lg:bottom-24' : 'bottom-4',
          'z-100',
          'fixed right-4 flex h-8 w-16 cursor-pointer items-center rounded-full bg-[#00000020] p-2 transition-colors dark:bg-[#ffffff20] md:h-10 md:w-[5.5rem]',
        )}
        onClick={() => {
          setTheme(prev => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))
        }}
      >
        <input
          aria-label="Toggle theme mode"
          className={clsx(
            'transition-color h-6 w-6  cursor-pointer appearance-none rounded-full drop-shadow-toggle transition-transform ease-in-out md:h-7 md:w-7',
            'translate-x-0 bg-white',
            'dark:translate-x-[100%] dark:bg-gray-300 md:dark:translate-x-[160%]',
          )}
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
        />
      </div>
    </>
  )
}

export default ThemeToggle
