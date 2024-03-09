import {NavLink} from '@remix-run/react'
import type {MdxPage} from 'types'
import {dotFormattedDate} from '~/utils/misc'
import {H2} from '../typography'
import {twMerge} from 'tailwind-merge'

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
        <span className="text-lg">
          <NavLink
            prefetch="intent"
            className="mr-2 font-bold uppercase text-accent dark:opacity-80"
            to={`/tags/${tag}`}
          >
            {tag}
          </NavLink>
          <span className="text-accent">
            {date ? dotFormattedDate(date) : null}
          </span>
        </span>
        <NavLink prefetch="intent" to={`/${slug}`}>
          <H2 className="my-0">{title}</H2>
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
