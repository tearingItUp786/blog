import { type BaseItem } from '@algolia/autocomplete-core'
import {
	type AutocompleteApi,
	type AutocompleteState,
	getAlgoliaResults,
} from '@algolia/autocomplete-js'

import { InstantSearch } from 'react-instantsearch-core'
import { H3 } from '../typography'
import { Autocomplete } from './autocomplete'
import { algoliaSearchClient } from '~/utils/algolia'

export default function AlgoliaSearch({
	searchRef,
	setOnMount,
	initialState,
}: {
	searchRef: React.MutableRefObject<AutocompleteApi<BaseItem> | null>
	setOnMount: () => void
	initialState?: Partial<AutocompleteState<BaseItem>>
}) {
	// handle initial search provider results (just so we can render the icon properly)
	return (
		<InstantSearch
			// TODO: figure out why this is not working
			searchClient={algoliaSearchClient as any}
			indexName="website"
			future={{ preserveSharedStateOnUnmount: true }}
		>
			<div className="relative hidden">
				<div className="flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0">
					<Autocomplete
						setOnMount={setOnMount}
						initialState={initialState}
						className="hidden"
						searchRef={searchRef}
						openOnFocus
						placeholder="Search TIL/blog posts"
						detachedMediaQuery=""
						// TODO: figure out why this is not working
						getSources={({ query }) => {
							return [
								{
									sourceId: 'all_results',
									getItemUrl({ item }: any) {
										return item.type === 'til'
											? `/${item.type}#${item.objectID}?offset=${item.offset}&q=${query}`
											: `/${item.type}/${item.objectID}?q=${query}`
									},
									getItems() {
										const results = getAlgoliaResults({
											searchClient: algoliaSearchClient,
											queries: [
												{
													indexName: 'website',
													params: {
														query,
														hitsPerPage: 5,
													},
												},
											],
										})

										return results
									},
									templates: {
										noResults() {
											return (
												<div className="dark:text-charcoal-gray p-6 text-white">
													You ain't got no results 😔.
												</div>
											)
										},
										item({ item, components, state }: any) {
											return (
												<div className="aria-selected:bg-charcoal-gray dark:text-charcoal-gray cursor-default rounded-md p-3 text-sm text-white select-none aria-selected:text-white">
													<a
														className="dark:text-charcoal-gray! flex items-center justify-between space-x-4 text-white"
														href={
															item.type === 'til'
																? `/${item.type}?offset=${item.offset}&q=${state.query}#${item.objectID}`
																: `/${item.type}/${item.objectID}?q=${state.query}`
														}
													>
														<div>
															<H3 className="dark:text-charcoal-gray! my-2 text-white">
																{
																	(item as { data: { title: string } }).data
																		.title
																}
															</H3>
															{components.Snippet({
																hit: item,
																attribute: 'content',
															})}
														</div>
													</a>
												</div>
											)
										},
									},
								},
							] as any
						}}
					/>
				</div>
			</div>
		</InstantSearch>
	)
}
