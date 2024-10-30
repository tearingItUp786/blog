import {NavLink, useSearchParams} from '@remix-run/react'
import type {MdxPage} from 'types'
import {dotFormattedDate} from '~/utils/misc'
import {H2} from '~/components/typography'
import {twMerge} from 'tailwind-merge'
import {PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE} from '~/components/pill'

type Props = MdxPage['frontmatter'] & {
  slug: string
  className?: string
  descriptionClassName?: string
}

export function BlogCard({
  title,
  tag,
  date,
  subtitle,
  description,
  slug,
  className,
  descriptionClassName,
}: Props) {
  const [searchParams] = useSearchParams()
  return (
    <div
      className={twMerge(
        `
        relative 
        py-6 
        after:absolute 
        after:right-0 
        after:top-[2rem] 
        after:hidden 
        after:h-[2px] 
        after:bg-black 
        after:content-[""]
        after:dark:bg-white 
        md:after:block 
        `,
        className,
      )}
    >
      <div>
        <span>
          <NavLink
            prefetch="intent"
            className={twMerge(
              PILL_CLASS_NAME,
              PILL_CLASS_NAME_ACTIVE,
              'mr-4 inline px-2 py-1 uppercase',
            )}
            to={`/tags/${tag}?${searchParams.toString()}`}
          >
            {tag}
          </NavLink>
          <span className="text-accent">
            {date ? dotFormattedDate(date) : null}
          </span>
        </span>
        <NavLink prefetch="intent" to={`/${slug}?${searchParams.toString()}`}>
          <H2 className="mb-0 mt-2">{title}</H2>
        </NavLink>
      </div>
      <p
        className={twMerge(
          'text-center dark:text-white md:text-left',
          descriptionClassName,
        )}
      >
        {description ?? subtitle}
      </p>
    </div>
  )
}
