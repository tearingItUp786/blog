import { twMerge } from 'tailwind-merge'
import { SmallAsterisk, TextLink } from './typography'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
	attribution?: string
	author?: string
	containerClassName?: string
}

const sizesForScreens = [
	{ width: 480, maxWidth: 600 },
	{ width: 800, maxWidth: 1080 },
	{ width: 1280 },
]

export const CloudinaryHeroImage = ({
	alt,
	src,
	attribution,
	author,
	containerClassName,
}: Props) => {
	const srcSet = sizesForScreens.map((size) => {
		const newValue = `f_auto,w_${size.width},c_scale`
		const newSrc = src?.replace(/(upload\/).*?((\d|\w)+\/)/, `$1${newValue}/$2`)
		return {
			srcSetValue: `${newSrc} ${size.width}w`,
			width: size,
			newSrc,
		}
	})

	const sizes = sizesForScreens.reduce((acc, curr) => {
		const accVal = acc === '' ? '' : `${acc},`

		const mediaWidth = curr.maxWidth
			? `(max-width: ${curr.maxWidth}px) ${curr.width}px`
			: `${curr.width}px`

		if (acc === '') return mediaWidth

		return `${accVal} ${mediaWidth}`
	}, '')

	const showAttribution = attribution && author

	return (
		<div className={twMerge('aspect-h-9 aspect-w-16 mb-6', containerClassName)}>
			<img
				width={`${sizesForScreens[sizesForScreens.length - 1]?.width}`}
				height={500}
				className="mb-4 mt-0"
				alt={alt}
				src={srcSet[srcSet.length - 1]?.newSrc ?? src}
				sizes={sizes}
				srcSet={srcSet.map((o) => o.srcSetValue).join(',')}
			/>
			{showAttribution ? (
				<SmallAsterisk>
					Image by{' '}
					<TextLink small href={attribution}>
						{author}
					</TextLink>{' '}
					from{' '}
					<TextLink small href={attribution}>
						Pixabay
					</TextLink>
				</SmallAsterisk>
			) : null}
		</div>
	)
}
