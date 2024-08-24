import {algoliaSearchClient} from '~/utils/algolia'

import {AutocompleteApi, getAlgoliaResults} from '@algolia/autocomplete-js'
import {InstantSearch} from 'react-instantsearch-core'
import {H3} from '../typography'
import {Autocomplete} from './autocomplete'
import {BaseItem} from '@algolia/autocomplete-core'

export default function AlgoliaSearch({
  searchRef,
}: {
  searchRef: React.MutableRefObject<AutocompleteApi<BaseItem> | null>
}) {
  // handle initial search provider results (just so we can render the icon properly)
  return (
    <InstantSearch
      searchClient={algoliaSearchClient}
      indexName="website"
      future={{preserveSharedStateOnUnmount: true}}
    >
      <div className="relative ">
        <div className="sm:static sm:inset-auto sm:ml-6 sm:pr-0 flex items-center">
          <Autocomplete
            initialState={{isOpen: true}}
            className="hidden"
            searchRef={searchRef}
            openOnFocus
            placeholder="Search for TIL or blog posts"
            detachedMediaQuery=""
            getSources={({query}) => {
              return [
                {
                  sourceId: 'all_results',
                  getItemUrl({item}) {
                    return item.type === 'til'
                      ? `/${item.type}#${item.objectID}?offset=${item.offset}&q=${query}`
                      : `/${item.type}/${item.objectID}?q=${query}`
                  },
                  getItems() {
                    let results = getAlgoliaResults({
                      searchClient: algoliaSearchClient,
                      queries: [
                        {
                          indexName: 'website',
                          query,
                          params: {
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
                        <div className="p-6 text-white dark:text-gray-300">
                          You ain't got no results 😔.
                        </div>
                      )
                    },
                    item({item, components, state}) {
                      return (
                        <div className="cursor-default select-none rounded-md p-3 text-sm text-white aria-selected:bg-gray-300 aria-selected:text-white dark:text-gray-300">
                          <a
                            className="flex items-center justify-between space-x-4"
                            href={
                              item.type === 'til'
                                ? `/${item.type}?offset=${item.offset}&q=${state.query}#${item.objectID}`
                                : `/${item.type}/${item.objectID}?q=${state.query}`
                            }
                          >
                            <div>
                              <H3 className="my-2 text-white dark:!text-gray-300">
                                {(item as {data: {title: string}}).data.title}
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
              ]
            }}
          />
        </div>
      </div>
    </InstantSearch>
  )
}
