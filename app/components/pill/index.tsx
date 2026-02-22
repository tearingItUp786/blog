import { twJoin } from 'tailwind-merge'

export const PILL_CLASS_NAME = `
  group
  flex w-fit items-center
  rounded-md border-[1.5px] border-solid border-accent bg-transparent px-4 py-1 
  font-medium 
  leading-5
  no-underline	
`

export const PILL_CLASS_NAME_ACTIVE =
	'transition-colors hover:bg-accent hover:text-charcoal-gray group-hover:text-charcoal-gray'

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
				'py-1.5 text-lg leading-6',
				isActive
					? 'border-accent text-accent hover:bg-accent'
					: 'border-border-color text-border-color',
			)}
		>
			{children}
		</span>
	)
}

export { Pill }
