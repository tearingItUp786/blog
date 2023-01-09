import React from 'react'
import { json, LoaderFunction, useFetcher, useLoaderData } from 'remix'
import { TilCard } from '~/components/til/til-card'
import { getMdxComponent, getMdxTilList } from '~/utils/mdx'

const getPage = (searchParams: URLSearchParams) =>
  Number(searchParams.get('page') || '1')

export const loader: LoaderFunction = async ({ request }) => {
  const page = getPage(new URL(request.url).searchParams)

  const tilList = await getMdxTilList(page)

  return json({ tilList })
}

export default function TilPage() {
  let data = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  const [shouldFetch, setShouldFetch] = React.useState(true)
  const [page, setPage] = React.useState(2)
  const [tilList, setTilList] = React.useState(data.tilList)

  const [scrollPosition, setScrollPosition] = React.useState(0)
  const [clientHeight, setClientHeight] = React.useState(0)
  const [height, setHeight] = React.useState(null)

  // Set the height of the parent container whenever photos are loaded
  const divHeight = React.useCallback(
    (node) => {
      if (node !== null) {
        setHeight(node.getBoundingClientRect().height)
      }
    },
    [tilList.length]
  )

  let components = React.useMemo(() => {
    return tilList.map((til) => {
      return {
        ...til,
        component: getMdxComponent(String(til.code)),
      }
    })
  }, [tilList.length])

  // Add Listeners to scroll and client resize
  React.useEffect(() => {
    const scrollListener = () => {
      setClientHeight(window.innerHeight)
      setScrollPosition(window.scrollY)
    }

    // Avoid running during SSR
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', scrollListener)
    }

    // Clean up
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', scrollListener)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!shouldFetch || !height) return
    if (clientHeight + scrollPosition + 1000 < height) return

    fetcher.load(`/til?index&page=${page}`)

    setShouldFetch(false)
  }, [clientHeight, scrollPosition, fetcher])

  React.useEffect(() => {
    if (fetcher.data && fetcher.data.length === 0) {
      setShouldFetch(false)
      return
    }

    // Photos contain data, merge them and allow the possiblity of another fetch
    if (fetcher.data && fetcher.data.tilList.length > 0) {
      setTilList((prev: any) => [...prev, ...fetcher.data.tilList])
      setPage((page: number) => page + 1)
      setShouldFetch(true)
    }
  }, [fetcher.data])

  return (
    <div
      className='
    ml-[18vw] mr-[10vw] pb-8 relative mt-8
    after:hidden
    after:md:block
    after:content-[""]
    after:absolute
    after:top-[10px]
    after:left-[-13vw]
    after:h-full
    after:w-[2px]
    after:bg-gray-100
    after:dark:bg-white
    '
    >
      <div
        ref={divHeight}
        className='max-w-full prose prose-light dark:prose-dark'
      >
        {components.map((til, i) => {
          const Component: any = components?.[i]?.component
          return (
            <TilCard
              key={til.path}
              title={til.frontmatter.title}
              date={til.frontmatter.date}
              tag={til.frontmatter.tag}
            >
              <Component />
            </TilCard>
          )
        })}
      </div>
    </div>
  )
}
