import { NavLink, useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'
import { type MdxPage } from 'types'
import { PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE } from '~/components/pill'
import { H2, InlineImage } from '~/components/typography'
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
	hero,
}: Props) {
	const [searchParams] = useSearchParams()
	return (
		<div className={twMerge(`relative`, className)}>
			<InlineImage
				lazyLoadImage
				aspectH="aspect-h-5"
				containerClassName="flex-1 basis-full lg:basis-7/12 mx-0 lg:mx-0 my-0 lg:my-0"
				src={hero}
				alt={title}
			/>
			<div className="basis-full p-8 pt-6 lg:basis-5/12">
				<NavLink
					className="text-body hover:underline"
					prefetch="intent"
					to={`/${slug}?${searchParams.toString()}`}
				>
					<H2 className="mb-2 mt-0 text-center font-normal md:text-left md:text-2xl">
						{title}
					</H2>
					<p
						className={twMerge(
							'text-center text-body dark:text-white md:text-left',
						)}
					>
						{description ?? subtitle}
					</p>
				</NavLink>
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
			</div>
		</div>
	)
}
