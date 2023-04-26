import clsx from 'clsx'

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
      className={clsx(fontSizes[size], titleColors[variant], className)}
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

// TODO: need a better way to handle inline images in mdx
export const InlineImage = ({
  src,
  alt,
  children,
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  children?: React.ReactNode
}) => {
  const hasChildren = children !== undefined
  const containerClass = hasChildren ? '' : 'mx-auto'
  return (
    <div className="mx-8 my-4 lg:mx-24 lg:my-8">
      <div className={clsx('aspect-h-4  aspect-w-8 w-full ', containerClass)}>
        <img
          className="mx-auto my-0"
          src={src?.replace('/upload/', '/upload/f_auto/')}
          alt={alt}
        />
        {hasChildren ? <div>{children}</div> : null}
      </div>
    </div>
  )
}
