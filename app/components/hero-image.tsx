import {SmallAsterisk, TextLink} from './typography'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  attribution?: string
  author?: string
}

export const HeroImage = ({alt, src, attribution, author}: Props) => {
  const showAttribution = attribution && author
  return (
    <div className="mb-6 aspect-w-16 aspect-h-9">
      <img className="mb-4 mt-0" alt={alt} src={src} />
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
