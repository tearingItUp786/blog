import { motion, useReducedMotion } from 'framer-motion'
import { NavLink, useSearchParams } from 'react-router'
import { twJoin, twMerge } from 'tailwind-merge'
import { PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE } from '~/components/pill'
import { H1 } from '~/components/typography'
import { dotFormattedDate } from '~/utils/misc'

type Props = {
	title?: string
	date?: string
	tag?: string
	children?: React.ReactNode
	showBlackLine?: boolean
	id?: string
	titleTo: string
	isAboveFold?: boolean
}

// Horizontal connector line classes (::after pseudo-element kept as CSS)
const connectorLineClasses = `
    after:hidden
    after:md:block
    after:absolute
    after:top-5
    after:-left-24
    lg:after:-left-26
    after:bg-dark-gray-100
    dark:after:bg-white
    after:h-0.5
    after:w-12
    lg:after:w-18
    `

// used for the TIL and the blog
export const ContentCard = ({
	id,
	title,
	date,
	tag,
	children,
	showBlackLine = true,
	titleTo,
	isAboveFold = false,
}: Props) => {
	const [searchParams] = useSearchParams()
	const prefersReducedMotion = useReducedMotion()

	const revealVariants = {
		hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.4,
				ease: [0.25, 1, 0.5, 1], // ease-out-quart
			},
		},
	}

	const dotVariants = {
		hidden: { scale: prefersReducedMotion ? 1 : 0, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				type: 'spring' as const,
				stiffness: 320,
				damping: 20,
				delay: 0.15,
			},
		},
	}

	return (
		<motion.div
			id={id}
			className={twJoin(
				showBlackLine && connectorLineClasses,
				'relative scroll-mt-4',
			)}
			variants={revealVariants}
			initial={isAboveFold ? false : 'hidden'}
			whileInView="visible"
			viewport={{ once: true, amount: 0.15 }}
		>
			{/* Timeline dot — real DOM element so Framer Motion can spring it */}
			{showBlackLine ? (
				<motion.span
					aria-hidden="true"
					className="bg-dark-gray-100 absolute top-5 -left-10 hidden h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full md:block dark:bg-white"
					variants={dotVariants}
					initial={isAboveFold ? false : 'hidden'}
					whileInView="visible"
					viewport={{ once: true, amount: 0.15 }}
				/>
			) : null}

			<div className="">
				<div className="mb-4 flex items-center">
					<NavLink
						className={twMerge(
							PILL_CLASS_NAME,
							PILL_CLASS_NAME_ACTIVE,
							'mr-4 px-2 py-1 uppercase',
						)}
						to={`/tags/${tag}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
					>
						{tag}
					</NavLink>
					<span className="text-accent text-lg">
						{dotFormattedDate(date ?? '')}
					</span>
				</div>
				<NavLink className="group no-underline" to={titleTo}>
					<H1
						As="h2"
						className="break-word my-4 leading-[1em] transition-all group-hover:underline md:my-0 md:break-normal"
					>
						{title}
					</H1>
				</NavLink>
			</div>
			<div className="mt-2 text-lg md:text-left">{children}</div>
		</motion.div>
	)
}
