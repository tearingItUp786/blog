import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

type Props = {
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}
export function MobileNav({ isOpen, setIsOpen }: Props) {
	return (
		<div
			className={clsx(
				'lg:hidden',
				isOpen
					? 'before:scale-100 before:opacity-100'
					: 'before:scale-0 before:opacity-0',
				'before:bg-charcoal-gray block before:fixed before:top-[-5vh] before:left-0 before:z-10 before:h-[105vh] before:w-[105vw] before:origin-top-right before:rounded-xs before:transition-all before:content-[""] dark:before:bg-white',
			)}
		>
			<button
				aria-label="Hamburger menu"
				className={clsx(
					'border-radius-[-4px] pointer absolute top-3.5 right-0 z-20 translate-y-[-50%] border-none bg-transparent p-4 pt-5',
				)}
				onClick={() => setIsOpen((o: boolean) => !o)}
			>
				<div
					className={twMerge(
						'absolute top-5 left-0.75 h-0.5 w-6 transition-all duration-300 ease-in-out',
						'before:absolute before:left-0 before:h-0.5 before:w-6 before:transition-all before:duration-300 before:ease-in-out before:content-[""]',
						'after:absolute after:top-4 after:left-0 after:h-0.5 after:w-6 after:transition-all after:duration-300 after:ease-in-out after:content-[""]',
						isOpen
							? 'before:bg-accent after:bg-accent bg-transparent before:top-2 before:rotate-[-45deg] after:top-2 after:rotate-[45deg]'
							: 'bg-charcoal-gray before:bg-charcoal-gray after:bg-charcoal-gray before:top-2 before:rotate-0 after:top-4 after:rotate-[0deg] dark:bg-white dark:before:bg-white dark:after:bg-white',
					)}
				/>
			</button>
		</div>
	)
}
