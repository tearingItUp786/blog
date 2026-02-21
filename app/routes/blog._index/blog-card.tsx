import { NavLink, useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'
import { PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE } from '~/components/pill'
import { H2, InlineImage } from '~/components/typography'
import { type MdxPage } from '~/schemas/github'
import { dotFormattedDate } from '~/utils/misc'

type Props = MdxPage['frontmatter'] & {
	slug: string
	className?: string
	descriptionClassName?: string
	lazyLoadImage?: boolean
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
	lazyLoadImage = true,
}: Props) {
	const [searchParams] = useSearchParams()
	return (
		<div className={twMerge(`relative`, className)}>
			<InlineImage
				lazyLoadImage={lazyLoadImage}
				fetchpriority={lazyLoadImage ? 'auto' : 'high'}
				imgDivClassName="aspect-[8/5]"
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
					<H2 className="mt-0 mb-2 text-center font-normal md:text-left md:text-2xl">
						{title}
					</H2>
					<p
						className={twMerge(
							'text-body text-center md:text-left dark:text-white',
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
