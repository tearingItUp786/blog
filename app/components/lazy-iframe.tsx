import {twMerge} from 'tailwind-merge'
import {TextLink} from './typography'

/**
 * Must be used with vanilla-lazyload
 */
type Props = {
  src: string
  containerClassName?: string
  giphyAtrributionSrc: string
}
export const LazyGiphy = ({
  src,
  containerClassName,
  giphyAtrributionSrc,
}: Props) => {
  return (
    <>
      <div className={twMerge('relative h-0', containerClassName)}>
        <iframe
          data-src={src}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{position: 'absolute'}}
          className="lazy giphy-embed"
          allowFullScreen
        ></iframe>
      </div>
      <p>
        <TextLink href={giphyAtrributionSrc}>via GIPHY</TextLink>
      </p>
    </>
  )
}
