import { type BaseItem } from '@algolia/autocomplete-core'
import { type AutocompleteApi } from '@algolia/autocomplete-js'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'
import { ToastUI } from '../toast-ui'
import { useHotkeys } from '~/hooks/use-hot-keys'

const loadSearch = async (cb?: any) => {
	const comp = await import('./search-wrapper')
	cb?.()
	return comp
}

const LazyAlgoliaSearch = lazy(loadSearch)

type SearchButtonProps = {
	onClick: React.MouseEventHandler<HTMLButtonElement>
	onPointerOver?: React.MouseEventHandler<HTMLButtonElement>
	onFocus?: React.FocusEventHandler<HTMLButtonElement>
}

function SearchButton({ onClick, onPointerOver, onFocus }: SearchButtonProps) {
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	return (
		<>
			<button
				disabled={!isMounted}
				onFocus={onFocus}
				onClick={onClick}
				onPointerOver={onPointerOver}
				className={twJoin(
					'group shadow-custom-black relative mr-12 block cursor-pointer rounded-sm bg-white px-6 py-1 lg:mr-0 dark:bg-gray-200',
					!isMounted && 'cursor-not-allowed',
				)}
			>
				<span
					className={twJoin(
						'text-body flex h-10 items-center rounded-xs border-0 bg-transparent text-xl transition-colors',
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

/**
 * A Search component that uses Algolia's autocomplete feature.
 * It Lazily loads the AlgoliaSearch component
 */
export function Search() {
	const searchRef = useRef<AutocompleteApi<BaseItem> | null>(null)
	const [mountedStatus, setMountedStatus] = useState<
		'mounting' | 'mounted' | 'idle'
	>('idle')

	const [showToast, setShowToast] = useState(false)
	const [showAlgoliaSearch, setShowAlgoliaSearch] = useState(false)

	useHotkeys(
		'cmd+k, ctrl+k',
		(event) => {
			event.preventDefault()
			if (showAlgoliaSearch) {
				searchRef.current?.setIsOpen(false)
				return
			}

			setShowAlgoliaSearch(true)
			setMountedStatus('mounting')
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

	const loadHandler = async () => {
		if (mountedStatus === 'idle') {
			setMountedStatus('mounting')
			await loadSearch(() => {
				setMountedStatus('mounted')
			})
		}
	}

	const onClick = async () => {
		if (mountedStatus === 'idle') {
			await loadHandler()
		}

		if (mountedStatus === 'mounting') {
			setShowAlgoliaSearch(true)
		}

		if (mountedStatus === 'mounted') {
			searchRef.current?.setIsOpen(true)
			setShowAlgoliaSearch(true)
		}
	}

	return (
		<>
			<SearchButton
				onFocus={() => loadHandler()}
				onPointerOver={() => loadHandler()}
				onClick={onClick}
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
