import type {BaseItem} from '@algolia/autocomplete-core'
import type {AutocompleteOptions} from '@algolia/autocomplete-js'
import {autocomplete} from '@algolia/autocomplete-js'
import {createElement, Fragment, useEffect, useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {usePagination, useSearchBox} from 'react-instantsearch-core'
import {useHotkeys} from '~/hooks/use-hot-keys'

import {useSearchParams} from '@remix-run/react'
import clsx from 'clsx'

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  className?: string
}

type SetInstantSearchUiStateOptions = {
  query: string
  isOpen: boolean
}

export function Autocomplete({
  className,
  ...autocompleteProps
}: AutocompleteProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const autocompleteContainer = useRef<HTMLDivElement>(null)
  const searchRef = useRef<any>(null)
  const panelRootRef = useRef<any>(null)
  const rootRef = useRef<any>(null)
  const {query, refine: setQuery} = useSearchBox()
  const {refine: setPage} = usePagination()

  const [instantSearchUiState, setInstantSearchUiState] =
    useState<SetInstantSearchUiStateOptions>({
      query: initialQuery,
      isOpen: false,
    })

  useEffect(() => {
    setQuery(instantSearchUiState.query)
    setPage(0)
    if (instantSearchUiState.isOpen) {
      setSearchParams(
        prev => {
          prev.set('q', instantSearchUiState.query)
          if (instantSearchUiState.query === '') {
            prev.delete('q')
          }
          return prev
        },
        {
          replace: true,
          preventScrollReset: true,
        },
      )
    }
  }, [instantSearchUiState])

  useHotkeys(
    'cmd+k, ctrl+k',
    (event: any) => {
      event.preventDefault()
      searchRef.current?.setIsOpen(!instantSearchUiState.isOpen)
    },
    [instantSearchUiState.isOpen],
  )

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      classNames: {
        detachedSearchButton: 'hidden',
        detachedOverlay: 'px-8 p-16 z-30 absolute inset-0 transition-opacity',
        detachedContainer:
          'shadow-2xl bg-gray-100 dark:bg-white z-30 flex flex-col w-full h-screen max-w-5xl mx-auto overflow-hidden transition-all transform divide-y divide-gray-500 shadow-2xl divide-opacity-20 md:h-auto md:rounded-xl',
        detachedFormContainer: 'flex relative flex-none',
        detachedCancelButton: 'hidden',
        form: 'flex-1',
        inputWrapperPrefix: 'text-white dark:text-gray-100',
        input:
          'h-16 w-full border-0 bg-transparent px-14 pr-4 dark:text-gray-300 text-white placeholder-gray-500 focus:outline-none appearance-none',
        submitButton:
          'absolute w-6 h-6 text-gray-500 pointer-events-none top-5 left-4',
        loadingIndicator:
          'absolute w-6 h-6 text-gray-500 pointer-events-none top-5 left-4 animate-spin',
        clearButton:
          'text-white dark:text-gray-100 flex hidden:hidden items-center justify-center absolute top-0 right-0 h-full w-16 group text-gray-500 transition-colors hover:text-pink',
        panel:
          'overflow-y-auto flex-1 flex flex-col divide-y-[0.5px] border-white dark:border-gray-300 divide-white dark:divide-gray-300 divide-opacity-20',
      },
      container: autocompleteContainer.current,
      initialState: {query: initialQuery, isOpen: false},
      onStateChange({prevState, state}) {
        if (
          prevState.query !== state.query ||
          prevState.isOpen !== state.isOpen
        ) {
          setInstantSearchUiState({
            query: state.query,
            isOpen: state.isOpen,
          })
        }
      },
      // TODO: fix this
      // @ts-ignore
      renderer: {createElement, Fragment, render: () => {}},
      render({children}, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root

          panelRootRef.current?.unmount()
          panelRootRef.current = createRoot(root)
        }

        panelRootRef.current.render(children)
      },
    })

    searchRef.current = autocompleteInstance
    return () => searchRef.current?.destroy()
  }, [])

  return (
    <>
      <SearchButton
        onClick={() => {
          searchRef.current?.setIsOpen(true)
        }}
        query={query}
      />

      <div className="pointer-events-none fixed inset-0 z-20 overflow-y-auto md:p-6 lg:p-10">
        <div className="sm:block sm:p-0 flex items-end justify-center">
          <div className={className} ref={autocompleteContainer} />
        </div>
      </div>
    </>
  )
}

type SearchButtonProps = {
  onClick(): void
  query?: string
}

function SearchButton({onClick, query}: SearchButtonProps) {
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
            'sm:text-sm flex h-10 items-center rounded-sm border-0 bg-transparent  text-lg text-white transition-colors dark:text-gray-300',
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
