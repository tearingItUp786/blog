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
					isOpen ? 'fixed' : 'absolute',
					'border-radius-[-4px] pointer absolute top-[14px] right-[0] z-10 translate-y-[-50%] border-none bg-transparent p-4 pt-5',
				)}
				onClick={() => setIsOpen((o: boolean) => !o)}
			>
				<div
					className={twMerge(
						'absolute top-[20px] left-[3px] h-[2px] w-[24px] transition-all duration-300 ease-in-out',
						'before:absolute before:left-0 before:h-[2px] before:w-[24px] before:transition-all before:duration-300 before:ease-in-out before:content-[""]',
						'after:absolute after:top-[16px] after:left-0 after:h-[2px] after:w-[24px] after:transition-all after:duration-300 after:ease-in-out after:content-[""]',
						isOpen
							? 'before:bg-accent after:bg-accent bg-transparent before:top-[8px] before:rotate-[-45deg] after:top-[8px] after:rotate-[45deg]'
							: 'bg-charcoal-gray before:bg-charcoal-gray after:bg-charcoal-gray before:top-[8px] before:rotate-0 after:top-[16px] after:rotate-[0deg] dark:bg-white dark:before:bg-white dark:after:bg-white',
					)}
				/>
			</button>
		</div>
	)
}
