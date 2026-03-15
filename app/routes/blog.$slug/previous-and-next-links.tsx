import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { twMerge } from 'tailwind-merge'
import { H4 } from '~/components/typography'

type BlogLink = {
	title?: string
	to?: string
}

type Props = {
	previous: BlogLink | null
	next: BlogLink | null
	className?: string
}

const arrowVariants = {
	hover: {
		x: -6,
		transition: { type: 'spring', stiffness: 200, damping: 18 },
	},
}

const nextArrowVariants = {
	hover: {
		x: 6,
		transition: { type: 'spring', stiffness: 200, damping: 18 },
	},
}

export function PreviousAndNextLinks({ previous, next, className }: Props) {
	return (
		<div
			className={twMerge(
				'mt-8 mb-6 flex',
				next && !previous ? 'justify-end' : 'justify-between',
				className,
			)}
		>
			{previous ? (
				<div className="max-w-[48%]">
					<Link
						prefetch="intent"
						className="group flex items-start md:items-center"
						to={`/blog/${String(previous.to)}`}
					>
						<motion.svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="text-body group-hover:text-accent order-0 mt-1 h-5 w-5 min-w-5 md:mt-0 lg:block"
							variants={arrowVariants}
							whileHover="hover"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.75 19.5L8.25 12l7.5-7.5"
							/>
						</motion.svg>

						<H4 className="text-body group-hover:text-accent text-lg md:text-lg">
							{previous?.title}
						</H4>
					</Link>
				</div>
			) : null}
			{next ? (
				<div className="max-w-[48%]">
					<Link
						prefetch="intent"
						className="group flex items-start md:items-center"
						to={`/blog/${String(next.to)}`}
					>
						<motion.svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="text-body group-hover:text-accent order-1 mt-1 h-5 w-5 min-w-5 md:mt-0 lg:block"
							variants={nextArrowVariants}
							whileHover="hover"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.25 4.5l7.5 7.5-7.5 7.5"
							/>
						</motion.svg>

						<H4 className="text-body group-hover:text-accent text-right text-lg md:text-lg">
							{next?.title}
						</H4>
					</Link>
				</div>
			) : null}
		</div>
	)
}
