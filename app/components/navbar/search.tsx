import {BaseItem} from '@algolia/autocomplete-core'
import {AutocompleteApi} from '@algolia/autocomplete-js'
import clsx from 'clsx'
import {lazy, Suspense, useEffect, useRef, useState} from 'react'
import {twJoin} from 'tailwind-merge'
import {useHotkeys} from '~/hooks/use-hot-keys'
import {ToastUI} from '../toast-ui'

const LazyAlgoliaSearch = lazy(() => import('./search-wrapper'))

type SearchButtonProps = {
  onClick: () => void
  onFocus: () => void
  onMouseOver: () => void
  isSearchUnmounted?: boolean
}

function SearchButton({
  isSearchUnmounted,
  onClick,
  onFocus,
  onMouseOver,
}: SearchButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      <button
        disabled={isSearchUnmounted}
        onFocus={onFocus}
        onMouseOver={onMouseOver}
        onClick={onClick}
        className={twJoin(
          'focus:ring-offset-gray-800 mr-10 rounded-full p-1 text-white transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 dark:text-gray-300 md:hidden',
        )}
      >
        <span className="sr-only">Search</span>
      </button>

      <button
        disabled={!isMounted || isSearchUnmounted}
        onFocus={onFocus}
        onMouseOver={onMouseOver}
        onClick={onClick}
        className={clsx(
          'group relative mr-12 block lg:mr-0',
          !isMounted && 'cursor-not-allowed',
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
  const [mountedStatus, setMountedStatus] = useState<
    'mounting' | 'mounted' | 'idle'
  >('idle')

  const [showToast, setShowToast] = useState(false)
  const [showAlgoliaSearch, setShowAlgoliaSearch] = useState(false)

  useHotkeys(
    'cmd+k, ctrl+k',
    event => {
      event.preventDefault()
      if (!showAlgoliaSearch) {
        setMountedStatus('mounting')
        setShowAlgoliaSearch(true)
      }
    },
    [],
  )

  useEffect(() => {
    if (mountedStatus === 'mounting') {
      const timeout = setTimeout(() => setShowToast(true), 500)
      return () => clearTimeout(timeout)
    }

    if (mountedStatus === 'mounted') {
      setShowToast(false)
    }
  }, [mountedStatus])

  const loadHandler = () => {
    if (mountedStatus === 'idle') {
      setMountedStatus('mounting')
      setShowAlgoliaSearch(true)
    }
  }
  return (
    <>
      <SearchButton
        isSearchUnmounted={mountedStatus !== 'mounted'}
        onFocus={loadHandler}
        onMouseOver={loadHandler}
        onClick={() => searchRef.current?.setIsOpen(true)}
      />
      {showAlgoliaSearch ? (
        <Suspense>
          <LazyAlgoliaSearch
            setOnMount={() => setMountedStatus('mounted')}
            searchRef={searchRef}
          />
        </Suspense>
      ) : null}
      {showToast ? <ToastUI msg="Loading Search..." /> : null}
    </>
  )
}
