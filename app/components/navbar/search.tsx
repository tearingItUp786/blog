import { type BaseItem } from '@algolia/autocomplete-core'
import { type AutocompleteApi } from '@algolia/autocomplete-js'
import {
	HotkeysProvider,
	formatForDisplay,
	useAppHotkeys,
	useHotkey,
	useHotkeyHint,
} from '@tanstack/react-hotkeys'
import { twJoin } from 'cnfast'
import { AnimatePresence } from 'framer-motion'
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react'
import { ToastUI } from '../toast-ui'
import {
	initialSearchState,
	searchStateReducer,
	shouldShowSearchToast,
} from './search-state'
import { appHotkeys } from '~/components/hotkeys/registry'

const importSearchModule = () => import('./search-wrapper')

let searchModulePromise: ReturnType<typeof importSearchModule> | null = null

function loadSearch() {
	searchModulePromise ??= importSearchModule()
	return searchModulePromise
}

const LazyAlgoliaSearch = lazy(loadSearch)

type SearchButtonProps = {
	onClick: React.MouseEventHandler<HTMLButtonElement>
	onPointerOver?: React.PointerEventHandler<HTMLButtonElement>
	onFocus?: React.FocusEventHandler<HTMLButtonElement>
	isOpen: boolean
}

function SearchButton({
	onClick,
	onPointerOver,
	onFocus,
	isOpen,
}: SearchButtonProps) {
	const [hasHydrated, setHasHydrated] = useState(false)
	const hotkeys = useAppHotkeys()
	const binding = hotkeys['search.toggle']
	const showHint = useHotkeyHint(binding)
	const label =
		hasHydrated && binding.hotkey ? formatForDisplay(binding.hotkey) : 'Search'

	useEffect(() => {
		setHasHydrated(true)
	}, [])

	return (
		<>
			<button
				disabled={!hasHydrated}
				onFocus={onFocus}
				onClick={onClick}
				onPointerOver={onPointerOver}
				aria-label={label === 'Search' ? 'Search' : `Search (${label})`}
				aria-expanded={isOpen}
				data-shortcut-hint={showHint}
				className={twJoin(
					'group shadow-custom-black dark:bg-dark-gray-200 relative mr-12 block rounded-sm bg-white px-6 py-1 lg:mr-0',
					!hasHydrated && 'cursor-not-allowed',
					'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2',
				)}
			>
				<span
					className={twJoin(
						'text-body flex h-10 items-center rounded-xs border-0 bg-transparent text-xl transition-colors',
						hasHydrated && 'group-hover:text-accent',
						!hasHydrated && 'cursor-not-allowed',
						showHint && 'text-accent underline underline-offset-4',
					)}
				>
					{label}
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
	const [isOpen, setIsOpen] = useState(false)
	const [searchState, dispatch] = useReducer(
		searchStateReducer,
		initialSearchState,
	)
	const [showToast, setShowToast] = useState(false)
	const isWaitingToOpen = shouldShowSearchToast(searchState)

	const preloadSearch = useCallback(() => {
		void loadSearch()
	}, [])

	const requestOpenSearch = useCallback(() => {
		// NOTE: when we have the reference to the Aloglia search ready, we are ready to use its internal state handler to open it.
		if (searchState.isSearchReady) {
			searchRef.current?.setIsOpen(true)
			return
		}

		// Module is not ready to be used (no reference to search) so dispatch a state update and preloadSearch
		dispatch({ type: 'request-open' })
		preloadSearch()
	}, [preloadSearch, searchState.isSearchReady])

	const handleSearchReady = useCallback(() => {
		dispatch({ type: 'ready' })
	}, [])

	useEffect(() => {
		if (!isWaitingToOpen) {
			setShowToast(false)
			return
		}

		const timeout = setTimeout(() => setShowToast(true), 750)
		return () => clearTimeout(timeout)
	}, [isWaitingToOpen])

	useEffect(() => {
		if (searchState.hasPendingOpenRequest && searchState.isSearchReady) {
			searchRef.current?.setIsOpen(true)
			dispatch({ type: 'opened' })
		}
	}, [searchState.hasPendingOpenRequest, searchState.isSearchReady])

	return (
		<HotkeysProvider scope={isOpen ? 'search' : undefined} exclusive={isOpen}>
			<SearchKeyboardBindings
				isOpen={isOpen}
				onToggle={() =>
					isOpen ? searchRef.current?.setIsOpen(false) : requestOpenSearch()
				}
				onClose={() => searchRef.current?.setIsOpen(false)}
			/>
			<SearchButton
				isOpen={isOpen}
				onFocus={preloadSearch}
				onPointerOver={preloadSearch}
				onClick={requestOpenSearch}
			/>
			{searchState.hasRenderedSearch ? (
				<Suspense>
					<LazyAlgoliaSearch
						setOnMount={handleSearchReady}
						searchRef={searchRef}
						onOpenChange={setIsOpen}
					/>
				</Suspense>
			) : null}
			<AnimatePresence>
				{showToast ? <ToastUI msg="Loading Search..." /> : null}
			</AnimatePresence>
		</HotkeysProvider>
	)
}

function SearchKeyboardBindings({
	isOpen,
	onToggle,
	onClose,
}: {
	isOpen: boolean
	onToggle: () => void
	onClose: () => void
}) {
	useHotkey(appHotkeys['search.toggle'], onToggle)
	useHotkey(appHotkeys['search.close'], onClose, {
		enabled: isOpen,
		ignoreInputs: false,
	})
	return null
}
