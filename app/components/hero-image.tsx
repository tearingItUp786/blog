import { twMerge } from 'tailwind-merge'
import { SIZES_FOR_SCREENS } from './constants'
import { SmallAsterisk, TextLink } from './typography'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
	attribution?: string
	author?: string
	containerClassName?: string
}

export const CloudinaryHeroImage = ({
	alt,
	src,
	attribution,
	author,
	containerClassName,
}: Props) => {
	const sources = SIZES_FOR_SCREENS.map((size) => {
		const newValue = `f_auto,w_${size.width},c_scale`
		const newSrc = src?.replace(/(upload\/).*?((\d|\w)+\/)/, `$1${newValue}/$2`)

		return {
			src: newSrc,
			width: size.width,
			maxWidth: size.maxWidth,
		}
	})

	const showAttribution = attribution && author
	const largestImageSource = sources[sources.length - 1]?.src || src

	return (
		<div className={twMerge('mb-6 aspect-[16/9]', containerClassName)}>
			<picture>
				{sources.slice(0, -1).map((source, index) => (
					<source
						key={index}
						srcSet={source.src}
						media={
							source.maxWidth ? `(max-width: ${source.maxWidth}px)` : undefined
						}
						width={source.width}
					/>
				))}
				<img
					className="mt-0 mb-4"
					src={largestImageSource}
					alt={alt}
					width={sources[sources.length - 1]?.width || undefined}
					height={500}
				/>
			</picture>
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
