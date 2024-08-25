import {BaseItem} from '@algolia/autocomplete-core'
import {AutocompleteApi} from '@algolia/autocomplete-js'
import {lazy, Suspense, useEffect, useRef, useState} from 'react'
import {twJoin} from 'tailwind-merge'
import {useHotkeys} from '~/hooks/use-hot-keys'
import {ToastUI} from '../toast-ui'

const LazyAlgoliaSearch = lazy(() => import('./search-wrapper'))

type SearchButtonProps = {
  onClick: () => void
  loadSearchInstance: () => void
}

function SearchButton({onClick, loadSearchInstance}: SearchButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      <button
        onFocus={loadSearchInstance}
        onTouchStart={loadSearchInstance}
        onMouseOver={loadSearchInstance}
        onClick={onClick}
        className={twJoin(
          'focus:ring-offset-gray-800 mr-10 rounded-full p-1 text-white transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 dark:text-gray-300 md:hidden',
        )}
      >
        <span className="sr-only">Search</span>
      </button>

      <button
        disabled={!isMounted}
        onFocus={loadSearchInstance}
        onTouchStart={loadSearchInstance}
        onMouseOver={loadSearchInstance}
        onClick={onClick}
        className={twJoin(
          'group relative mr-12 block lg:mr-0',
          !isMounted && 'cursor-not-allowed',
        )}
      >
        <span
          className={twJoin(
            'sm:text-sm flex h-10 items-center rounded-sm border-0 bg-transparent text-xl text-white transition-colors dark:text-gray-300',
            isMounted && 'group-hover:text-pink',
            !isMounted && 'cursor-not-allowed',
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
  const [initialSearchState, setInitialSearchState] = useState({
    isOpen: true,
  })

  useHotkeys(
    'cmd+k, ctrl+k',
    event => {
      event.preventDefault()
      if (!showAlgoliaSearch) {
        setShowAlgoliaSearch(true)
        setMountedStatus('mounting')
        return
      }

      searchRef.current?.setIsOpen(false)
    },
    [mountedStatus],
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
      setInitialSearchState({
        isOpen: false,
      })
      setMountedStatus('mounting')
      setShowAlgoliaSearch(true)
    }
  }
  return (
    <>
      <SearchButton
        loadSearchInstance={loadHandler}
        onClick={() => {
          if (mountedStatus === 'mounting') {
            return
          }

          if (mountedStatus === 'mounted') {
            searchRef.current?.setIsOpen(true)
            return
          }

          if (mountedStatus === 'idle') {
            setShowAlgoliaSearch(true)
            setMountedStatus('mounting')
            setInitialSearchState({
              isOpen: true,
            })
          }
        }}
      />
      {showAlgoliaSearch ? (
        <Suspense>
          <LazyAlgoliaSearch
            setOnMount={() => setMountedStatus('mounted')}
            initialState={initialSearchState}
            searchRef={searchRef}
          />
        </Suspense>
      ) : null}
      {showToast ? <ToastUI msg="Loading Search..." /> : null}
    </>
  )
}
