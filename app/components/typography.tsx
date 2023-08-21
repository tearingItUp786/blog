import {twMerge} from 'tailwind-merge'

import clsx from 'clsx'
import {Link} from '@remix-run/react'

const fontSizes = {
  h1: 'font-display font-bold text-3xl md:text-5xl',
  h2: 'font-body font-bold text-2xl md:text-3xl',
  h3: 'font-body font-medium text-xl md:text-2xl',
  h4: 'font-body font-medium text-lg md:text-xl uppercase',
  h5: 'font-body font-medium text-lg',
}

const titleColors = {
  primary: 'text-gray-100 dark:text-white',
  secondary: 'text-gray-300 dark:text-white',
}

type TitleProps = {
  variant?: 'primary' | 'secondary'
  As?: React.ElementType
  className?: string
  id?: string
} & (
  | {children: React.ReactNode}
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
}: TitleProps & {size: keyof typeof fontSizes}) {
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
    style={{fontStyle: 'oblique'}}
    className={clsx(
      'font-body text-2xl font-light uppercase dark:text-white [&>p]:my-0',
      className,
    )}
    {...rest}
  >
    {children}
    {author ? (
      <span
        className={clsx(
          'block text-right text-lg text-accent',
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
    style={{fontStyle: 'oblique'}}
    className={clsx(
      titleColors['secondary'],
      'my-4 font-body text-lg font-light uppercase [&>p]:my-0',
      containerClassName,
    )}
    {...rest}
  >
    {children}
    {author ? (
      <>
        <span className="ml-2 mr-2">-</span>
        <span className="text-lg text-accent">{author}</span>
      </>
    ) : null}
  </div>
)

export const TextLink = ({children, ...rest}: CommonProps) => {
  return (
    <a target="_blank" className="font-medium text-accent underline" {...rest}>
      {children}
    </a>
  )
}

export const SmallAsterisk = ({children, ...rest}: CommonProps) => (
  <div className="font-body text-sm text-accent" {...rest}>
    {children}
  </div>
)

const LinkOrFragment = ({
  href,
  children,
}: {
  href?: string
  children: React.ReactNode
}) => {
  if (!href) return <> {children} </>

  return (
    <Link target="_blank" to={href}>
      {children}
    </Link>
  )
}

// TODO: need a better way to handle inline images in mdx
const sizesForScreens = [
  {width: 480, maxWidth: 600},
  {width: 800, maxWidth: 1080},
  {width: 1280},
]

export const InlineImage = ({
  src,
  alt,
  children,
  containerClassName,
  imgDivClassName,
  aspectW = 'aspect-w-8',
  aspectH = 'aspect-h-4',
  lazyLoadImage = false,
  className,
  openInNewTab = false,
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  children?: React.ReactNode
  containerClassName?: string
  aspectW?: string
  aspectH?: string
  imgDivClassName?: string
  lazyLoadImage?: boolean
  openInNewTab?: boolean
}) => {
  // open in new tab and stuff
  const srcSet = sizesForScreens.map(size => {
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

  const hasChildren = children !== undefined
  const containerClass = hasChildren ? '' : 'mx-auto'

  const srcToUse = srcSet[srcSet.length - 1]?.newSrc ?? src

  const srcProps = {
    [lazyLoadImage ? 'data-src' : 'src']: srcToUse,
    [lazyLoadImage ? 'data-sizes' : 'sizes']: sizes,
    [lazyLoadImage ? 'data-srcset' : 'srcSet']: srcSet
      .map(o => o.srcSetValue)
      .join(', '),
  }

  return (
    <div
      className={twMerge(
        'mx-8 my-4 max-w-7xl lg:mx-24 lg:my-8',
        containerClassName,
      )}
    >
      <div
        className={twMerge(
          'w-full',
          imgDivClassName,
          !imgDivClassName && aspectW,
          !imgDivClassName && aspectH,
          containerClass,
        )}
      >
        <LinkOrFragment href={openInNewTab ? src : undefined}>
          <img
            className={twMerge(
              'mx-auto my-0',
              lazyLoadImage && 'lazy',
              className,
            )}
            alt={alt}
            {...srcProps}
          />
          {hasChildren ? <div>{children}</div> : null}
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
