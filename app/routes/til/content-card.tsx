import {NavLink, useSearchParams} from '@remix-run/react'
import clsx from 'clsx'
import {dotFormattedDate} from '~/utils/misc'
import {H1} from '~/components/typography'

type Props = {
  title?: string
  date?: string
  tag?: string
  children?: React.ReactNode
  showBlackLine?: boolean
  id?: string
  titleTo: string
}

const blackLinkClasses = `
    after:hidden
    after:md:block
    after:absolute
    after:top-[10px]
    after:left-[-8rem]
    after:bg-gray-100
    after:dark:bg-white
    after:h-[2px]
    after:w-20

    before:hidden
    before:md:block
    before:content: ""
    before:absolute
    before:rounded-full
    before:h-[18px]
    before:w-[18px]
    before:top-[12px]
    before:left-[-2.5rem]
    before:bg-gray-100
    before:dark:bg-white
    before:translate-y-[-50%]
    before:translate-x-[-50%]
`

// used for the TIL and the blog
export const ContentCard = ({
  id,
  title,
  date,
  tag,
  children,
  showBlackLine = true,
  titleTo,
}: Props) => {
  const [searchParams] = useSearchParams()
  return (
    <div
      id={id}
      className={clsx(showBlackLine && blackLinkClasses, 'relative')}
    >
      <div className="block items-start md:flex">
        <div className="order-0 mr-6 block flex-col text-lg text-accent md:flex">
          {dotFormattedDate(date ?? '')}
          <NavLink
            className="ml-4 mr-2 font-bold uppercase text-accent no-underline md:ml-0"
            to={`/tags/${tag}?${searchParams.toString()}`}
          >
            {tag}
          </NavLink>
        </div>
        <NavLink className="group no-underline" to={titleTo}>
          <H1 className="break-word my-4 leading-[1em] transition-all group-hover:underline md:my-0 md:break-normal">
            {title}
          </H1>
        </NavLink>
      </div>
      <div className="mt-2 text-lg md:text-left">{children}</div>
    </div>
  )
}
