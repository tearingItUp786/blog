import {twJoin} from 'tailwind-merge'

export const PILL_CLASS_NAME = `
  group
  flex w-fit items-center
  rounded border-[1.5px] border-solid border-accent bg-transparent px-4 py-1 text-lg
  font-medium 
  
`

const Pill = ({
  children,
  isActive,
}: {
  children: React.ReactNode
  isActive?: boolean
}) => {
  return (
    <span
      className={twJoin(
        PILL_CLASS_NAME,
        isActive
          ? 'border-accent text-accent hover:bg-accent'
          : 'border-border-color text-border-color ',
      )}
    >
      {children}
    </span>
  )
}

export {Pill}
