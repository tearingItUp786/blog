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
          'fixed right-4 flex h-10 w-[5.5rem] cursor-pointer items-center rounded-full bg-[#00000020] p-2 transition-colors dark:bg-[#ffffff20]',
        )}
        onClick={() => {
          setTheme(prev => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))
        }}
      >
        <input
          className={clsx(
            'transition-color h-7 w-7 cursor-pointer appearance-none rounded-full drop-shadow-toggle transition-transform ease-in-out',
            'translate-x-0 bg-white',
            'dark:translate-x-[160%] dark:bg-gray-300',
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
