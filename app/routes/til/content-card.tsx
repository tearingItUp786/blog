import clsx from 'clsx'
import { NavLink, useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'
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
}

const blackLinkClasses = `
    after:hidden
    after:md:block
    after:absolute
    after:top-5
    after:-left-24
    lg:after:-left-26
    after:bg-gray-100
    dark:after:bg-white
    after:h-0.5
    after:w-12
    lg:after:w-18

    before:hidden
    before:md:block
    before:content: ""
    before:absolute
    before:rounded-full
    before:h-4.5
    before:w-4.5
    before:top-5
    before:-left-10
    before:bg-gray-100
    dark:before:bg-white
    before:-translate-y-1/2
    before:-translate-x-1/2
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
}: Props) => {
	const [searchParams] = useSearchParams()
	return (
		<div
			id={id}
			className={clsx(
				showBlackLine && blackLinkClasses,
				'relative scroll-mt-4',
			)}
		>
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
		</div>
	)
}
