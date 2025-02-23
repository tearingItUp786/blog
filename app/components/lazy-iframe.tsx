import {twMerge} from 'tailwind-merge'
import {TextLink} from './typography'

/**
 * Must be used with vanilla-lazyload
 */
type Props = {
  src: string
  containerClassName?: string
  giphyAttributionSrc: string
}
export const LazyGiphy = ({
  src,
  containerClassName,
  giphyAttributionSrc,
}: Props) => {
  return (
    <>
      <div className={twMerge('relative h-0', containerClassName)}>
        <iframe
          title="a giphy iframe"
          data-src={src}
          width="100%"
          height="100%"
          style={{position: 'absolute'}}
          className="lazy giphy-embed"
          allowFullScreen
        ></iframe>
      </div>
      <p>
        <TextLink href={giphyAttributionSrc}>via GIPHY</TextLink>
      </p>
    </>
  )
}
