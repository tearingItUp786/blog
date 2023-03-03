import clsx from 'clsx'
import {NavLink} from '@remix-run/react'
import type {MdxPage} from 'types'
import {dotFormattedDate} from '~/utils/misc'
import {H2} from '../typography'

type Props = MdxPage['frontmatter'] & {slug: string; className?: string}

export function BlogCard({
  title,
  tag,
  date,
  subtitle,
  description,
  slug,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        `
        relative 
        py-6 
        after:absolute 
        after:top-[2rem] 
        after:right-0 
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
          <NavLink className="linkable-tag mr-2" to={`/tags/${tag}`}>
            {tag}
          </NavLink>
          <span className="text-accent">
            {date ? dotFormattedDate(date) : null}
          </span>
        </span>
        <NavLink to={`/${slug}`}>
          <H2 className="my-0 uppercase">{title}</H2>
        </NavLink>
      </div>
      <p className="text-center dark:text-white md:text-left">
        {description ?? subtitle}
      </p>
    </div>
  )
}
