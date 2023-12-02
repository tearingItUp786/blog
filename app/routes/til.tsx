import {json, LoaderFunctionArgs} from '@remix-run/node'
import {useFetcher, useLoaderData} from '@remix-run/react'
import {useEffect, useRef, useState} from 'react'
import LazyLoad, {ILazyLoadInstance} from 'vanilla-lazyload'
import {getMdxTilListGql} from '~/utils/mdx'
import {useFooterObserver} from '~/hooks/use-footer-observer'
import {TilComponent} from '~/components/til/til-component'

import styles from '~/styles/til.css'
import {TilMdxPage} from 'types'

export async function loader({request}: LoaderFunctionArgs) {
  const params = new URLSearchParams(request.url.split('?')[1])

  let endOffset = Number(params.get('offset'))
  let fromFetcher = params.get('fromFetcher')

  console.log('from fetcher', fromFetcher)

  // create array of arrays of 20 from the tilList;

  if (!endOffset) endOffset = 1
  // need to call this loader until we reach the end offset
  // because the end offset dicates how many calls we need to make
  const data = await getMdxTilListGql({endOffset})

  let maxOffset = data.maxOffset
  endOffset = endOffset > maxOffset ? maxOffset : endOffset

  // we only want the one call
  // if we are calling from the fetcher
  if (fromFetcher) {
    return json({
      fullList: data.fullList,
      serverEndOffset: endOffset,
      maxOffset,
    })
  }

  // create a list of chunked pages
  // that we want to send server side to render the correct
  // output for the til page
  let fullList: TilMdxPage[] = []
  let promises: ReturnType<typeof getMdxTilListGql>[] = []

  for (let i = 1; i <= endOffset; i++) {
    promises.push(getMdxTilListGql({endOffset: i}))
  }

  await Promise.all(promises).then(values => {
    values.forEach(value => {
      fullList = [...fullList, ...value.fullList]
      maxOffset = value.maxOffset
    })
  })

  return json({
    fullList,
    serverEndOffset: endOffset,
    maxOffset,
  })
}

export default function TilPage() {
  const {fullList, maxOffset, serverEndOffset} = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof loader>()
  const lazyLoadRef = useRef<ILazyLoadInstance | null>(null)

  const [items, setItems] = useState<TilMdxPage[]>(fullList)
  const [offset, setOffset] = useState<number>(serverEndOffset)

  useFooterObserver({
    onIntersect: () => {
      if (offset === maxOffset) return
      fetcher.load(`/til?fromFetcher=true&offset=${offset + 1}`)
      setOffset(p => p + 1)
    },
  })

  useEffect(() => {
    if (lazyLoadRef.current === null) {
      lazyLoadRef.current = new LazyLoad()
    } else {
      lazyLoadRef.current.update()
    }
  }, [offset])

  useEffect(() => {
    if (!fetcher.data || fetcher.state === 'loading') {
      return
    }

    if (fetcher.data) {
      setItems(prevAssets => [
        ...prevAssets,
        ...(fetcher?.data?.fullList ?? []),
      ])
    }
  }, [fetcher.data])

  return (
    <div
      className='
    relative ml-[10vw] mr-[10vw] mt-8 pb-8 after:absolute
    after:left-[-11vw]
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
        {items?.map(til => {
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
