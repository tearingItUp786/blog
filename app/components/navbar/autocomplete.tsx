import {type BaseItem} from '@algolia/autocomplete-core'
import {
  type AutocompleteOptions,
  autocomplete,
  type AutocompleteApi,
} from '@algolia/autocomplete-js'
import {createElement, Fragment, useEffect, useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {usePagination, useSearchBox} from 'react-instantsearch-core'
import {useSearchParams} from 'react-router'
import {useHotkeys} from '~/hooks/use-hot-keys'

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  className?: string
  searchRef: React.MutableRefObject<AutocompleteApi<BaseItem> | null>
  setOnMount: () => void
}

type SetInstantSearchUiStateOptions = {
  query: string
  isOpen?: boolean
}

export function Autocomplete({
  className,
  searchRef,
  initialState,
  setOnMount,
  ...autocompleteProps
}: AutocompleteProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const autocompleteContainer = useRef<HTMLDivElement>(null)
  const panelRootRef = useRef<any>(null)
  const rootRef = useRef<any>(null)
  const {refine: setQuery} = useSearchBox()
  const {refine: setPage} = usePagination()

  const [instantSearchUiState, setInstantSearchUiState] =
    useState<SetInstantSearchUiStateOptions>({
      isOpen: true,
      query: initialQuery,
      ...initialState,
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
        detachedOverlay:
          'px-4 md:px-20 p-24 z-30 absolute inset-0 transition-opacity max-w-screen-xl mx-auto',
        detachedContainer:
          'shadow-2xl bg-gray-100 dark:bg-white z-30 flex flex-col w-full max-h-screen  mx-auto overflow-hidden transition-all transform divide-y divide-gray-500 shadow-2xl divide-opacity-20 md:h-auto rounded-xl',
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
      initialState: {isOpen: true, query: initialQuery, ...initialState},
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

          // panelRootRef.current?.unmount()
          panelRootRef.current = createRoot(root)
        }

        panelRootRef.current.render(children)
      },
    })

    searchRef.current = autocompleteInstance
    setOnMount()

    return () => {
      autocompleteInstance.setIsOpen(false)
      autocompleteInstance.destroy()
    }
  }, [])

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-20 overflow-y-auto md:p-6 lg:p-10">
        <div className="sm:block sm:p-0 flex items-end justify-center">
          <div
            data-id="autocomplete"
            className={className}
            ref={autocompleteContainer}
          />
        </div>
      </div>
    </>
  )
}
