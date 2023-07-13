import {HeadersFunction, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useEffect, useRef} from 'react'
import LazyLoad from 'vanilla-lazyload'
import {getMdxTilListGql} from '~/utils/mdx'
import {TilComponent} from '~/components/til/til-component'

import styles from '~/styles/til.css'

export async function loader() {
  const tilList = await getMdxTilListGql()

  let headers = {
    'Cache-Control':
      'public, max-age=86400, stale-while-revalidate=604800, s-maxage=86400',
  }

  return json({tilList}, {headers})
}

export const headers: HeadersFunction = ({loaderHeaders}) => {
  return {'Cache-Control': String(loaderHeaders.get('Cache-Control'))}
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
