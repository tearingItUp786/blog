import {BaseItem} from '@algolia/autocomplete-core'
import {AutocompleteApi} from '@algolia/autocomplete-js'
import clsx from 'clsx'
import {lazy, Suspense, useEffect, useRef, useState} from 'react'
import {useHotkeys} from '~/hooks/use-hot-keys'

const LazyAlgoliaSearch = lazy(() =>
  import('./algolia-search').then(module => ({default: module.AlgoliaSearch})),
)

type SearchButtonProps = {
  onClick(): void
  query?: string
}

function SearchButton({onClick}: SearchButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      <button
        onClick={onClick}
        className="focus:ring-offset-gray-800 mr-10 rounded-full p-1 text-white transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 dark:text-gray-300 md:hidden"
      >
        <span className="sr-only">Search</span>
      </button>
      {/*
        If the page takes a while to hydrate (e.g., slow connections) we display
        an HTML form so the search is still usable without JavaScript.
      */}

      <button
        disabled={!isMounted}
        onClick={onClick}
        className={clsx(
          'group relative mr-12 block lg:mr-0',
          !isMounted && 'cursor-not-allowed	',
        )}
      >
        <span
          className={clsx(
            'sm:text-sm flex h-10 items-center rounded-sm border-0 bg-transparent text-xl text-white transition-colors dark:text-gray-300',
            isMounted && 'group-hover:text-pink',
            'disabled:pointer-events-none',
          )}
        >
          {'⌘+K'}
        </span>
      </button>
    </>
  )
}

export function Search() {
  const searchRef = useRef<AutocompleteApi<BaseItem> | null>(null)
  const [showAlgoliaSearch, setShowAlgoliaSearch] = useState(false)

  useHotkeys(
    'cmd+k, ctrl+k',
    (event: any) => {
      event.preventDefault()
      if (!showAlgoliaSearch) {
        setShowAlgoliaSearch(true)
      }
    },
    [],
  )

  return (
    <>
      <SearchButton
        onClick={() => {
          searchRef.current?.setIsOpen(true)
          setShowAlgoliaSearch(true)
        }}
      />
      {showAlgoliaSearch ? (
        <Suspense>
          <LazyAlgoliaSearch searchRef={searchRef} />
        </Suspense>
      ) : null}
    </>
  )
}
