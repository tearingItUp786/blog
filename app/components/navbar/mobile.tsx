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
				'block before:fixed before:left-0 before:top-[-5vh] before:z-10 before:h-[105vh] before:w-[105vw] before:origin-top-right before:rounded-sm before:bg-charcoal-gray before:transition-all before:content-[""] before:dark:bg-white',
			)}
		>
			<button
				aria-label="Hamburger menu"
				className={clsx(
					isOpen ? 'fixed' : 'absolute',
					'border-radius-[-4px] pointer absolute right-[0] top-[14px] z-10 translate-y-[-50%] border-none bg-transparent p-4 pt-5',
				)}
				onClick={() => setIsOpen((o: boolean) => !o)}
			>
				<div
					className={twMerge(
						'absolute left-[3px] top-[20px] h-[2px] w-[24px] transition-all duration-300 ease-in-out',
						'before:absolute before:left-0 before:h-[2px] before:w-[24px] before:transition-all before:duration-300 before:ease-in-out before:content-[""]',
						'after:absolute after:left-0 after:top-[16px] after:h-[2px] after:w-[24px] after:transition-all after:duration-300 after:ease-in-out after:content-[""]',
						isOpen
							? 'bg-transparent before:top-[8px] before:rotate-[-45deg] before:bg-accent after:top-[8px] after:rotate-[45deg] after:bg-accent'
							: 'bg-charcoal-gray before:top-[8px] before:rotate-0 before:bg-charcoal-gray after:top-[16px] after:rotate-[0deg] after:bg-charcoal-gray dark:bg-white before:dark:bg-white after:dark:bg-white',
					)}
				/>
			</button>
		</div>
	)
}
