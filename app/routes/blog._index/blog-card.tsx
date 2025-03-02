import { NavLink, useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'
import { type MdxPage } from 'types'
import { PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE } from '~/components/pill'
import { H2 } from '~/components/typography'
import { dotFormattedDate } from '~/utils/misc'

type Props = MdxPage['frontmatter'] & {
	slug: string
	className?: string
	descriptionClassName?: string
}

export function BlogCard({
	title,
	tag,
	date,
	subtitle,
	description,
	slug,
	className,
	descriptionClassName,
}: Props) {
	const [searchParams] = useSearchParams()
	return (
		<div
			className={twMerge(
				`relative py-6 after:absolute after:top-[2rem] after:right-0 after:hidden after:h-[2px] after:bg-black after:content-[""] md:after:block dark:after:bg-white`,
				className,
			)}
		>
			<div>
				<span>
					<NavLink
						prefetch="intent"
						className={twMerge(
							PILL_CLASS_NAME,
							PILL_CLASS_NAME_ACTIVE,
							'mr-4 inline px-2 py-1 uppercase',
						)}
						to={`/tags/${tag}?${searchParams.toString()}`}
					>
						{tag}
					</NavLink>
					<span className="text-accent">
						{date ? dotFormattedDate(date) : null}
					</span>
				</span>
				<NavLink prefetch="intent" to={`/${slug}?${searchParams.toString()}`}>
					<H2 className="mt-2 mb-0">{title}</H2>
				</NavLink>
			</div>
			<p
				className={twMerge(
					'text-center md:text-left dark:text-white',
					descriptionClassName,
				)}
			>
				{description ?? subtitle}
			</p>
		</div>
	)
}
