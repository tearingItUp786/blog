import {useState, useEffect} from 'react'
import {twMerge} from 'tailwind-merge'

export let DesignModeToggle = () => {
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    document.designMode = document.designMode === 'on' ? 'off' : 'on'
  }, [edit])

  return (
    <>
      <p>Toggle document.designMode</p>
      <div
        className={twMerge(
          'z-100 flex h-8 w-[4.5rem] cursor-pointer items-center rounded-full bg-body p-2  transition-colors',
          edit && 'bg-accent',
        )}
        onClick={evt => {
          setEdit(p => !p)
        }}
      >
        <input
          id="website-theme-toggle"
          aria-label="Toggle theme mode"
          className={twMerge(
            'transition-color h-6 w-6  translate-x-0 cursor-pointer appearance-none rounded-full bg-white  drop-shadow-toggle transition-transform ease-in-out',
            `${edit ? 'translate-x-[135%] bg-white' : ''}`,
          )}
          type="checkbox"
          role="switch"
        />
      </div>
    </>
  )
}
