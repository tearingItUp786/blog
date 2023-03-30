import clsx from 'clsx'

type Props = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}
export function MobileNav({isOpen, setIsOpen}: Props) {
  return (
    <div
      className={clsx(
        'lg:hidden',
        isOpen
          ? 'before:scale-100 before:opacity-100'
          : 'before:scale-0 before:opacity-0',
        'block before:fixed before:left-0 before:top-[-5vh] before:z-10 before:h-[105vh] before:w-[105vw] before:origin-top-right before:rounded-sm before:bg-white before:transition-all before:content-[""] before:dark:bg-gray-100',
      )}
    >
      <button
        aria-label="Hamburger menu"
        className={clsx(
          isOpen ? 'fixed' : 'absolute',
          'border-radius-[-4px] pointer absolute top-[30px] right-[0] z-10 translate-y-[-50%] border-none bg-transparent p-4',
        )}
        onClick={() => setIsOpen((o: boolean) => !o)}
      >
        <div
          className={clsx(
            'absolute top-[10px] left-[3px] h-[2px] w-[24px] transition-all duration-300 ease-in-out',
            'before:absolute before:left-0 before:h-[2px] before:w-[24px] before:transition-all before:duration-300 before:ease-in-out before:content-[""]',
            'after:absolute after:top-[16px] after:left-0 after:h-[2px] after:w-[24px] after:transition-all  after:duration-300 after:ease-in-out after:content-[""]',
            isOpen
              ? 'bg-transparent before:top-[8px] before:rotate-[-45deg] before:bg-accent after:top-[8px] after:rotate-[45deg] after:bg-accent'
              : 'bg-white before:top-[8px] before:rotate-0 before:bg-white after:top-[16px] after:rotate-[0deg] after:bg-white dark:bg-gray-300 before:dark:bg-gray-300 after:dark:bg-gray-300 ',
          )}
        />
      </button>
    </div>
  )
}
