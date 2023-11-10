import {json, LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useEffect, useRef, useState} from 'react'
import LazyLoad, {ILazyLoadInstance} from 'vanilla-lazyload'
import {getMdxTilListGql} from '~/utils/mdx'
import {useFooterObserver} from '~/hooks/use-footer-observer'
import {TilComponent} from '~/components/til/til-component'

import styles from '~/styles/til.css'

export async function loader({request}: LoaderFunctionArgs) {
  const {chunkedList} = await getMdxTilListGql()

  let endOffset = Number(
    new URLSearchParams(request.url.split('?')[1]).get('offset'),
  )
  // create array of arrays of 20 from the tilList;

  if (!endOffset) endOffset = 1
  if (Number(endOffset) > chunkedList.length) endOffset = chunkedList.length

  return json({
    chunkedList,
    endIndex: endOffset,
  })
}

export default function TilPage() {
  const {chunkedList, endIndex} = useLoaderData<typeof loader>()
  const [currentEndIndex, setCurrentEndIndex] = useState(endIndex)
  const lazyLoadRef = useRef<ILazyLoadInstance | null>(null)

  // flatten chunked list into one array
  const flattenedList = chunkedList
    ?.slice(0, currentEndIndex)
    ?.flatMap(til => til)

  useFooterObserver({
    onIntersect: () => {
      if (currentEndIndex === chunkedList.length) return
      setCurrentEndIndex(prev => prev + 1)
    },
  })

  useEffect(() => {
    if (lazyLoadRef.current === null) {
      lazyLoadRef.current = new LazyLoad()
    } else {
      lazyLoadRef.current.update()
    }
  }, [currentEndIndex])

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
    xl:min-w-[1200px]
    xl:max-w-min
    '
    >
      <div className="prose prose-light max-w-full dark:prose-dark">
        {flattenedList?.map(til => {
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
