import {json, LoaderFunctionArgs} from '@remix-run/node'
import {
  MetaFunction,
  ShouldRevalidateFunctionArgs,
  useFetcher,
  useLoaderData,
} from '@remix-run/react'
import {useEffect, useRef, useState} from 'react'
import {TilMdxPage} from 'types'
import LazyLoad, {ILazyLoadInstance} from 'vanilla-lazyload'
import {TilComponent} from './til-component'
import {useFooterObserver} from '~/hooks/use-footer-observer'
import {getMdxTilListGql} from '~/utils/mdx-utils.server'

// css
import '~/styles/til.css'

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) {
    return false
  }

  return defaultShouldRevalidate
}

export const meta: MetaFunction<typeof loader> = () => {
  return [
    {title: `Taran "tearing it up" Bains | Today I Learned`},
    {
      name: 'description',
      content: 'A list of things I have learned today',
    },
  ]
}

export async function loader({request}: LoaderFunctionArgs) {
  const params = new URLSearchParams(request.url.split('?')[1])
  const endOffsetParam = params.get('offset')
  const fromFetcher = params.get('fromFetcher')

  // Use a logical OR to provide a default value for endOffset
  const endOffset = Number(endOffsetParam) || 1

  // Fetch initial data to determine maxOffset
  const initialData = await getMdxTilListGql({endOffset})
  let maxOffset = initialData.maxOffset
  const effectiveEndOffset = Math.min(endOffset, maxOffset)

  // If fromFetcher is true, return early
  if (fromFetcher) {
    return json({
      fullList: initialData.fullList,
      serverEndOffset: effectiveEndOffset,
      maxOffset,
    })
  }

  // Create a list of promises for each offset
  // This will allow us to fetch all the data in parallel
  const promises = Array.from({length: effectiveEndOffset}, (_, i) =>
    getMdxTilListGql({endOffset: i + 1}),
  )

  // Use Promise.all to wait for all promises and flatMap to combine the results
  // since we don't want to return an array of array's to our user
  const fullList: Array<TilMdxPage> = (await Promise.all(promises)).flatMap(
    value => {
      maxOffset = value.maxOffset // Update maxOffset if needed
      return value.fullList
    },
  )

  return json({
    fullList,
    serverEndOffset: effectiveEndOffset,
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
  }, [items])

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
