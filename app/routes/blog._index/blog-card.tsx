import { motion } from 'framer-motion'
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
		<motion.div
			className={twMerge(
				`group/card @container/card relative flex h-full w-full flex-wrap content-start @3xl:items-center`,
				className,
			)}
			whileHover={{
				y: -4,
				boxShadow: '0 8px 24px -4px rgba(235,54,161,0.15)',
				transition: { type: 'spring', stiffness: 150, damping: 20 },
			}}
		>
			<InlineImage
				lazyLoadImage={lazyLoadImage}
				fetchpriority={lazyLoadImage ? 'auto' : 'high'}
				imgDivClassName="aspect-[8/5]"
				imgWrapperClassName="relative overflow-hidden"
				className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.03]"
				containerClassName="flex-1 basis-full @3xl:basis-7/12 mx-0 my-0 mr-0 max-w-none lg:my-0 lg:mr-0"
				src={hero}
				alt={title}
			/>
			<div className="basis-full p-4 pt-6 @[240px]:p-8 @3xl:basis-5/12">
				<NavLink
					className="text-body hover:underline"
					prefetch="intent"
					to={`/${slug}?${searchParams.toString()}`}
				>
					<H2 className="mt-0 mb-2 text-center text-2xl! font-normal md:text-left md:text-2xl!">
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
				<span className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
					<NavLink
						prefetch="intent"
						className={twMerge(
							PILL_CLASS_NAME,
							PILL_CLASS_NAME_ACTIVE,
							'inline px-2 py-1 uppercase',
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
		</motion.div>
	)
}
