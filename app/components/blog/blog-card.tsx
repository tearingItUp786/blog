import clsx from 'clsx'
import { NavLink } from '@remix-run/react'
import type { MdxPage } from 'types'
import { dotFormattedDate } from '~/utils/misc'
import { H2 } from '../typography'

type Props = MdxPage['frontmatter'] & { slug: string; className?: string }

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
        py-6 
        relative 
        after:content-[""] 
        after:absolute 
        after:top-[2rem] 
        after:right-0 
        after:h-[2px] 
        after:bg-black 
        after:dark:bg-white
        after:hidden 
        md:after:block 
        `,
        className
      )}
    >
      <div>
        <span className='text-lg'>
          <NavLink
            className='font-bold text-pink dark:opacity-80 uppercase mr-2'
            to={`/tags/${tag}`}
          >
            {tag}
          </NavLink>
          <span className='text-pink dark:opacity-80'>
            {date ? dotFormattedDate(date) : null}
          </span>
        </span>
        <NavLink to={`/${slug}`}>
          <H2 className='uppercase my-0'>{title}</H2>
        </NavLink>
      </div>
      <p className='dark:text-white text-center md:text-left'>
        {description ?? subtitle}
      </p>
    </div>
  )
}
