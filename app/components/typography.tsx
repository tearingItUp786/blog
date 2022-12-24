import clsx from 'clsx'

const fontSizes = {
  h1: 'font-display font-bold text-5xl',
  h2: 'font-body font-bold text-3xl',
  h3: 'font-body font-medium text-2xl',
  h4: 'font-body font-medium text-xl uppercase',
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
      className={clsx(fontSizes[size], titleColors[variant], className)}
      {...rest}
    />
  )
}

export const H1 = (props: TitleProps) => {
  return <Title {...props} size='h1' />
}

export const H2 = (props: TitleProps) => {
  return <Title {...props} size='h2' />
}

export const H3 = (props: TitleProps) => {
  return <Title {...props} size='h3' />
}

export const H4 = (props: TitleProps) => {
  return <Title {...props} size='h4' />
}

export const H5 = (props: TitleProps) => {
  return <Title {...props} size='h5' />
}

type CommonProps = {
  children: React.ReactNode
  [key: string]: any
}

export const BlockQuote = ({ children, className, ...rest }: CommonProps) => (
  <blockquote
    style={{ fontStyle: 'oblique' }}
    className={clsx('font-body font-normal text-xl uppercase', className)}
    {...rest}
  >
    {children}
  </blockquote>
)

export const ShortQuote = ({ children, ...rest }: CommonProps) => (
  <div {...rest}>{children}</div>
)

export const TextLink = ({ children, ...rest }: CommonProps) => (
  <a target='_blank' {...rest}>
    {children}
  </a>
)

export const SmallAsterisk = ({ children, ...rest }: CommonProps) => (
  <div {...rest}>{children}</div>
)

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
    <div className={containerClass}>
      <img src={src} alt={alt} />
      {hasChildren ? <div>{children}</div> : null}
    </div>
  )
}
