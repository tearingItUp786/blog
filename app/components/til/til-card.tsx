import { NavLink } from '@remix-run/react'
import clsx from 'clsx'
import { dotFormattedDate } from '~/utils/misc'
import { H1, H2 } from '../typography'

type Props = {
  title?: string
  date?: string
  tag?: string
  children?: React.ReactNode
  showBlackLine?: boolean
  titleComponent?: 'h1' | 'h2'
}

const blackLinkClasses = `
    after:absolute
    after:top-[10px]
    after:left-[-13vw]
    after:bg-gray-100
    after:dark:bg-white
    after:h-[2px]
    after:w-[11vw]

    before:content: ""
    before:absolute
    before:rounded-full
    before:h-[18px]
    before:w-[18px]
    before:top-[12px]
    before:left-[-2vw]
    before:bg-gray-100
    before:dark:bg-white
    before:translate-y-[-50%]
    before:translate-x-[-50%]
`

export const TilCard = ({
  title,
  date,
  tag,
  children,
  showBlackLine = true,
  titleComponent = 'h1',
}: Props) => {
  const TitleComp = titleComponent === 'h1' ? H1 : H2
  return (
    <div className={clsx(showBlackLine && blackLinkClasses, 'relative')}>
      <div className='flex items-start'>
        <div className='flex flex-col text-lg mr-6 text-pink dark:opacity-80'>
          {date ? dotFormattedDate(date) : null}
          <NavLink
            className='font-bold no-underline text-pink dark:opacity-80 uppercase mr-2'
            to={`/tags/${tag}`}
          >
            {tag}
          </NavLink>
        </div>
        <TitleComp className='uppercase my-0 leading-[1em]'>{title}</TitleComp>
      </div>
      <div className='text-lg mt-2 md:text-left'>{children}</div>
    </div>
  )
}
