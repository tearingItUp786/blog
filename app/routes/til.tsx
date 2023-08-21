import {json, LoaderArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useEffect, useRef} from 'react'
import LazyLoad from 'vanilla-lazyload'
import {getMdxTilListGql} from '~/utils/mdx'
import {TilComponent} from '~/components/til/til-component'

import styles from '~/styles/til.css'

export async function loader({request}: LoaderArgs) {
  const fresh = new URL(request.url).searchParams.get('fresh')

  const cachifiedOptions = {
    forceFresh: fresh === 'true' && process.env.NODE_ENV !== 'production',
  }
  const tilList = await getMdxTilListGql({cachifiedOptions})

  return json({tilList})
}

export default function TilPage() {
  const {tilList} = useLoaderData<typeof loader>()
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      new LazyLoad()
      mountedRef.current = true
    }
  }, [])

  return (
    <div
      className='
    relative ml-[10vw] mr-[10vw] mt-8 pb-8 after:absolute
    after:left-[-13vw]
    after:top-[10px]
    after:hidden
    after:h-full
    after:w-[2px]
    after:bg-gray-100
    after:content-[""]
    after:dark:bg-white
    md:ml-[18vw]
    after:md:block
    xl:mx-auto
    xl:max-w-min
    '
    >
      <div className="prose prose-light max-w-full dark:prose-dark">
        {tilList.map(til => {
          return (
            <TilComponent
              key={`${til.frontmatter.title}-${til.frontmatter.date}`}
              til={til}
            />
          )
        })}
      </div>
    </div>
  )
}
export function links() {
  return [{rel: 'stylesheet', href: styles}]
}
