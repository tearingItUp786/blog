import { NavLink } from 'remix'
import type { MdxPage } from 'types'
import { dotFormattedDate } from '~/utils/misc'
import { H2 } from '../typography'

type Props = MdxPage['frontmatter'] & { slug: string }

export function BlogCard({
  title,
  tag,
  date,
  subtitle,
  description,
  slug,
}: Props) {
  return (
    <div className='max-w-[500px] py-6'>
      <div>
        <span className='text-lg'>
          <NavLink
            className='font-bold text-pink uppercase mr-2'
            to={`/tags/${tag}`}
          >
            {tag}
          </NavLink>
          <span className='text-pink'>
            {date ? dotFormattedDate(date) : null}
          </span>
        </span>
        <NavLink to={`${slug}`}>
          <H2 className='uppercase my-0'>{title}</H2>
        </NavLink>
      </div>
      <p className='dark:text-white'>{description ?? subtitle}</p>
    </div>
  )
}
