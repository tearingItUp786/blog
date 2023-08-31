import clsx from 'clsx'
import {useCallback, useState} from 'react'
import {useHotkeys} from '~/hooks/use-hot-keys'
import {Theme, useTheme} from '~/utils/theme-provider'
import {useFooterObserver} from '~/hooks/use-footer-observer'

const ThemeToggle = () => {
  const [, setTheme] = useTheme()
  const [isFooterVisible, setIsFooterVisible] = useState(false)

  useHotkeys('cmd+d, ctrl+d', (event: any) => {
    event.preventDefault()
    setTheme(prev => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))
  })

  useFooterObserver({
    onIntersect: useCallback(() => {
      setIsFooterVisible(true)
    }, []),
    onExit: useCallback(() => {
      setIsFooterVisible(false)
    }, []),
    observerOptions: {
      rootMargin: '0px',
    },
  })

  return (
    <>
      <div
        className={clsx(
          isFooterVisible ? 'absolute bottom-32 lg:bottom-24' : 'bottom-4',
          'z-100',
          'fixed right-4 flex h-8 w-16 cursor-pointer items-center rounded-full bg-[#00000030] p-2 transition-colors dark:bg-[#ffffff20] md:h-10 md:w-[5.5rem]',
        )}
        onClick={() => {
          setTheme(prev => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))
        }}
      >
        <input
          id="website-theme-toggle"
          aria-label="Toggle theme mode"
          className={clsx(
            'transition-color h-6 w-6  cursor-pointer appearance-none rounded-full drop-shadow-toggle transition-transform ease-in-out md:h-7 md:w-7',
            'translate-x-0 bg-gray-100',
            'dark:translate-x-[100%] dark:bg-white  md:dark:translate-x-[160%]',
          )}
          type="checkbox"
          role="switch"
        />
      </div>
    </>
  )
}

export default ThemeToggle
