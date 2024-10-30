import clsx from 'clsx'
import {Theme, useTheme} from '~/utils/theme-provider'

const ThemeToggle = () => {
  const [, setTheme] = useTheme()

  return (
    <>
      <div
        className={clsx(
          'z-100',
          'flex h-8 w-[4.5rem] cursor-pointer items-center rounded-full bg-accent p-2  transition-colors',
        )}
        onClick={() => {
          setTheme(prev => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))
        }}
      >
        <input
          id="website-theme-toggle"
          aria-label="Toggle theme mode"
          className={clsx(
            'transition-color h-6 w-6  cursor-pointer appearance-none rounded-full drop-shadow-toggle transition-transform ease-in-out ',
            'translate-x-0 bg-gray-100',
            'dark:translate-x-[135%] dark:bg-white',
          )}
          type="checkbox"
          role="switch"
        />
      </div>
    </>
  )
}

export default ThemeToggle
