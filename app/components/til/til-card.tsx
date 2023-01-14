import { NavLink } from '@remix-run/react'
import { dotFormattedDate } from '~/utils/misc'
import { H1 } from '../typography'

type Props = {
  title?: string
  date?: string
  tag?: string
  children?: React.ReactNode
}

export const TilCard = ({ title, date, tag, children }: Props) => {
  return (
    <div
      className='
    relative
    mb-24 last-of-type:mb-0 first-of-type:mt-16

    after:content: ""
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
    '
    >
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
        <H1 className='uppercase my-0 leading-[1em]'>{title}</H1>
      </div>
      <div className='text-lg mt-2 md:text-left'>{children}</div>
    </div>
  )
}
