import { Link } from 'react-router'
import { twJoin, twMerge } from 'tailwind-merge'
import { SIZES_FOR_SCREENS } from './constants'

const fontSizes = {
	h1: 'font-display font-bold text-3xl md:text-4xl',
	h2: 'font-body font-bold text-2xl md:text-3xl',
	h3: 'font-body font-bold text-xl md:text-2xl',
	h4: 'font-body font-normal text-lg md:text-xl uppercase',
	h5: 'font-body font-normal text-lg',
}

const titleColors = {
	primary: 'text-section-title-color',
	secondary: 'text-subheading-color',
}

type TitleProps = {
	variant?: 'primary' | 'secondary'
	As?: React.ElementType
	className?: string
	id?: string
} & (
	| { children: React.ReactNode }
	| {
			dangerouslySetInnerHTML: {
				__html: string
			}
	  }
)

function Title({
	variant = 'primary',
	As,
	size,
	className,
	...rest
}: TitleProps & { size: keyof typeof fontSizes }) {
	const Tag = As ?? size
	return (
		<Tag
			className={twMerge(fontSizes[size], titleColors[variant], className)}
			{...rest}
		/>
	)
}

export const H1 = (props: TitleProps) => {
	return <Title {...props} size="h1" />
}

export const H2 = (props: TitleProps) => {
	return <Title {...props} size="h2" />
}

export const H3 = (props: TitleProps) => {
	return <Title {...props} size="h3" />
}

export const H4 = (props: TitleProps) => {
	return <Title {...props} size="h4" />
}

export const H5 = (props: TitleProps) => {
	return <Title {...props} size="h5" />
}

type CommonProps = {
	children: React.ReactNode
	[key: string]: any
}

export const BlockQuote = ({
	children,
	className,
	author,
	authorClassName,
	...rest
}: CommonProps) => (
	<blockquote
		className={twJoin(
			'font-body text-xl font-normal italic md:text-2xl dark:text-white [&>p]:my-0 [&>p]:text-xl [&>p]:md:text-2xl',
			className,
		)}
		{...rest}
	>
		{children}
		{author ? (
			<span
				className={twJoin(
					'text-accent block text-right text-lg',
					authorClassName,
				)}
			>
				-{author}
			</span>
		) : null}
	</blockquote>
)

export const ShortQuote = ({
	children,
	author,
	containerClassName,
	...rest
}: CommonProps) => (
	<div
		className={twJoin(
			titleColors['secondary'],
			'font-body my-4 text-lg font-normal italic [&>p]:my-0',
			containerClassName,
		)}
		{...rest}
	>
		{children}
		{author ? (
			<>
				<span className="mr-2 ml-2">-</span>
				<span className="text-accent text-lg">{author}</span>
			</>
		) : null}
	</div>
)

export const TextLink = ({ children, ...rest }: CommonProps) => {
	return (
		<a target="_blank" className="text-accent font-bold underline" {...rest}>
			{children}
		</a>
	)
}

export const SmallAsterisk = ({ children, ...rest }: CommonProps) => (
	<div className="font-body text-accent text-sm" {...rest}>
		{children}
	</div>
)

type SrcSetEntry = (typeof SIZES_FOR_SCREENS)[number] & {
	srcSetValue: string
	newSrc: string
}

function buildSrcSet(src: string): SrcSetEntry[] {
	const isGif = /\.gif$/i.test(src)
	return SIZES_FOR_SCREENS.map(({ width, maxWidth }) => {
		const optimization = isGif ? 'c_scale' : `f_auto,c_scale,w_${width}`
		const newSrc = src.replace(
			/(upload\/).*?((\d|\w)+\/)/,
			`$1${optimization}/$2`,
		)
		return { srcSetValue: `${newSrc} ${width}w`, width, maxWidth, newSrc }
	})
}

const LinkOrFragment = ({
	href,
	children,
}: {
	href?: string
	children: React.ReactNode
}) => {
	if (!href) return <>{children}</>

	return (
		<Link target="_blank" to={href} rel="noreferrer">
			{children}
		</Link>
	)
}

export const InlineImage = ({
	src = '',
	alt,
	children,
	containerClassName,
	imgDivClassName = 'aspect-[8/4]',
	imgWrapperClassName,
	lazyLoadImage = false,
	className,
	openInNewTab = false,
	...imgProps
}: React.ImgHTMLAttributes<HTMLImageElement> & {
	children?: React.ReactNode
	containerClassName?: string
	imgDivClassName?: string
	imgWrapperClassName?: string
	lazyLoadImage?: boolean
	openInNewTab?: boolean
}) => {
	const srcSet = buildSrcSet(src)
	const [fallbackSource] = srcSet.slice(-1)
	const responsiveSources = srcSet.slice(0, -1)
	const fallbackSrc = fallbackSource?.newSrc ?? src
	const hasChildren = Boolean(children)

	const imageProps = {
		className: twMerge('mx-auto my-0', lazyLoadImage && 'lazy', className),
		alt,
		...(lazyLoadImage ? { 'data-src': fallbackSrc } : { src: fallbackSrc }),
		...imgProps,
	}

	return (
		<div
			className={twMerge(
				'mx-0 my-4 mr-16 max-w-7xl lg:mx-0 lg:my-8 lg:mr-32',
				containerClassName,
			)}
		>
			{/* We require this div container so that the picture elment renders correctly in the $blog.index route*/}
			<div
				className={twMerge(
					'w-full',
					imgDivClassName,
					!hasChildren && 'mx-auto',
					imgWrapperClassName,
				)}
			>
				<LinkOrFragment href={openInNewTab ? src : undefined}>
					{/* We require the CSS classes here so that the picture renders correctly in the blog slug routes */}
					<picture className={twMerge('my-0 w-full', imgDivClassName)}>
						{/* Generate source elements for different screen sizes */}
						{responsiveSources.map((source, index) => (
							<source
								key={`source-${index}`}
								media={
									source.maxWidth
										? `(max-width: ${source.maxWidth}px)`
										: undefined
								}
								{...(lazyLoadImage
									? { 'data-srcset': source.srcSetValue }
									: { srcSet: source.srcSetValue })}
								type="image/webp"
							/>
						))}

						{/* Fallback source for largest size */}
						<source
							{...(lazyLoadImage
								? { 'data-srcset': fallbackSource?.srcSetValue }
								: { srcSet: fallbackSource?.srcSetValue })}
							type="image/webp"
						/>

						{/* Fallback image */}
						<img {...imageProps} />
					</picture>
					{hasChildren && <div>{children}</div>}
				</LinkOrFragment>
			</div>
		</div>
	)
}

export const TilInlineImage = (
	props: React.ComponentProps<typeof InlineImage>,
) => {
	return <InlineImage lazyLoadImage {...props} />
}
