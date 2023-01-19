import { json, LoaderArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import React from 'react'
import { TilCard } from '~/components/til/til-card'
import { useScrollListener } from '~/hooks/use-scroll-listener'
import { getMdxTilList } from '~/utils/mdx'
import { initialState, tilMapper, tilReducer } from '~/utils/til-list'

const getPage = (searchParams: URLSearchParams) =>
  Number(searchParams.get('page') || '1')

export async function loader({ request }: LoaderArgs) {
  const page = getPage(new URL(request.url).searchParams)

  const tilList = await getMdxTilList(page)

  return json({ tilList })
}

export default function TilPage() {
  let data = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const [tilList, setTilList] = React.useState(() => data.tilList)

  const [
    { canFetch, page, scrollPosition, clientHeight, containerHeight },
    dispatch,
  ] = React.useReducer(tilReducer, initialState)

  let tilComponents = React.useMemo(
    () => tilList.map(tilMapper),
    [tilList.length]
  )

  // Add Listeners to scroll of the page
  useScrollListener({
    onScroll: React.useCallback(() => {
      dispatch({
        type: 'setOnScroll',
        payload: {
          scrollPosition: window.scrollY,
          clientHeight: window.innerHeight,
        },
      })
    }, []),
  })

  // set the height of the containing div whenever we load in new today i learnes (tils)
  const divHeight = React.useCallback(
    (node: HTMLDivElement) => {
      if (node !== null) {
        dispatch({
          type: 'setContainerHeight',
          payload: node.getBoundingClientRect().height,
        })
      }
    },
    [tilList.length]
  )

  React.useEffect(() => {
    if (fetcher.state !== 'idle' || !containerHeight) return
    if (clientHeight + scrollPosition + 100 < containerHeight) return
    if (canFetch === false) return

    fetcher.load(`/til?index&page=${page}`)
    dispatch({ type: 'setCanFetch', payload: false })
  }, [clientHeight, scrollPosition, fetcher.state, containerHeight])

  React.useEffect(() => {
    if (!canFetch && fetcher.data && fetcher.data.tilList.length > 0) {
      setTilList((prev: any) => [...prev, ...fetcher.data.tilList])
      dispatch({ type: 'setPage', payload: page + 1 })
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
        {tilComponents.map((til, i) => {
          const Component: any = tilComponents?.[i]?.component ?? null
          if (!til?.frontmatter) return null

          return (
            <div
              key={`${til.frontmatter.title}-${til.frontmatter.date}`}
              className='mb-24 last-of-type:mb-0 first-of-type:mt-16'
            >
              <TilCard
                title={til.frontmatter.title}
                date={til.frontmatter.date}
                tag={til.frontmatter.tag}
              >
                {Component ? <Component /> : null}
              </TilCard>
            </div>
          )
        })}
      </div>
    </div>
  )
}
