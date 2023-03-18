import {NavLink} from '@remix-run/react'
import clsx from 'clsx'
import {Logo} from './logo'

import {algoliaSearchClient} from '~/utils/algolia'
import {InstantSearch} from 'react-instantsearch-hooks-web'
import {Autocomplete} from './autocomplete'
import {getAlgoliaResults} from '@algolia/autocomplete-js'

export function Navbar() {
  const navClassName =
    'transition-[color] duration-300 flex justify-center pt-[5px] hover:!text-pink focus:!text-pink text-white block min-w-[150px] text-center dark:text-gray-300 text-xl italic font-light items-center'
  const activeClassName =
    '!text-pink font-display not-italic font-bold bg-white dark:bg-gray-100'
  const setNavClassName = ({isActive}: {isActive: boolean}) => {
    return clsx(navClassName, isActive && activeClassName)
  }

  return (
    <div className="flex w-full bg-gray-100 px-9 dark:bg-white lg:px-20">
      <div className="w-[80px]">
        <NavLink to="/">
          <Logo className="logoNavLink px-4 py-1" />
        </NavLink>
      </div>
      <div className="flex flex-grow justify-center">
        <NavLink className={setNavClassName} to="/til">
          TIL
        </NavLink>
        <NavLink className={setNavClassName} to="/blog">
          BLOG
        </NavLink>
        <NavLink className={setNavClassName} to="/about">
          ABOUT
        </NavLink>
      </div>

      <div className="flex items-center">
        <InstantSearch searchClient={algoliaSearchClient} indexName="website">
          <div className="relative">
            <div className="sm:static sm:inset-auto sm:ml-6 sm:pr-0 flex items-center pr-2">
              <Autocomplete
                openOnFocus
                placeholder="Search for TIL or blog posts"
                detachedMediaQuery=""
                getSources={({query}) => {
                  return [
                    {
                      sourceId: 'all_results',
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
                      onSelect() {
                        console.log('fuck')
                      },
                      templates: {
                        noResults() {
                          return (
                            <div className="p-6 text-white dark:text-gray-300">
                              You ain't got no results 😔.
                            </div>
                          )
                        },
                        item({item, components}) {
                          return (
                            <div className="aria-selected:bg-gray-300 aria-selected:text-white cursor-default select-none rounded-md p-3 text-sm text-white dark:text-gray-300">
                              <a
                                className="flex items-center justify-between space-x-4"
                                href={`/search/?q=${query}`}
                              >
                                <div>
                                  {(item as {data: {title: string}}).data.title}
                                  <br />
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
      </div>
    </div>
  )
}
