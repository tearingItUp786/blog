import {NavLink, useLocation} from '@remix-run/react'
import clsx from 'clsx'
import {Logo} from './logo'

import {algoliaSearchClient} from '~/utils/algolia'
import {InstantSearch} from 'react-instantsearch-hooks-web'
import {Autocomplete} from './autocomplete'
import {getAlgoliaResults} from '@algolia/autocomplete-js'
import {H3} from '../typography'
import {MobileNav} from './mobile'
import {useEffect, useState} from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false)
    }
  }, [loc])

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add(
        'overflow-hidden',
        'lg:overflow-auto',
      )
      document.body.classList.add('overflow-hidden', 'lg:overflow-auto')
    } else {
      document.documentElement.classList.remove(
        'overflow-hidden',
        'lg:overflow-auto',
      )
      document.body.classList.remove('overflow-hidden', 'lg:overflow-auto')
    }
  }, [isOpen])

  const navClassName =
    'transition-[color] dark:text-white bg-white dark:bg-gray-100 lg:dark:bg-white lg:dark:text-gray-300 lg:text-white lg:bg-transparent duration-300 flex justify-center pt-[5px] hover:!text-pink focus:!text-pink text-body block min-w-[150px] text-center  text-xl italic font-light items-center'
  const activeClassName =
    '!text-pink font-display not-italic font-bold bg-white lg:bg-white dark:lg:bg-gray-100 dark:bg-gray-100'
  const setNavClassName = ({isActive}: {isActive: boolean}) => {
    return clsx(navClassName, isActive && activeClassName)
  }

  return (
    <div className="relative flex w-full bg-gray-100 px-9 dark:bg-white">
      <div className="mr-[15px] w-[50px] px-0 md:w-[80px]  md:pr-6">
        <NavLink className="logoNavLink" to="/">
          <Logo className="py-1" />
        </NavLink>
      </div>
      <div
        className={clsx(
          isOpen
            ? 'scale-100 opacity-100'
            : 'lg:h-100vh h-auto scale-0 opacity-0 lg:visible lg:scale-100 lg:opacity-100',
          'fixed top-[63px] left-0 z-20 w-[100vw] flex-grow origin-top-right justify-center transition-transform lg:relative lg:top-[inherit] lg:flex lg:w-auto',
        )}
      >
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

      <div className="flex w-[100px] flex-grow items-center justify-end  md:pr-0 lg:flex-grow-0">
        <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />
        <InstantSearch searchClient={algoliaSearchClient} indexName="website">
          <div className="relative ">
            <div className="sm:static sm:inset-auto sm:ml-6 sm:pr-0 flex items-center">
              <Autocomplete
                openOnFocus
                placeholder="Search for TIL or blog posts"
                detachedMediaQuery=""
                getSources={({query}) => {
                  return [
                    {
                      sourceId: 'all_results',
                      getItemUrl({item}) {
                        return item.type === 'til'
                          ? `/${item.type}#${item.objectID}`
                          : `/${item.type}/${item.objectID}`
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
                            <div className="cursor-default select-none rounded-md p-3 text-sm text-white aria-selected:bg-gray-300 aria-selected:text-white dark:text-gray-300">
                              <a
                                className="flex items-center justify-between space-x-4"
                                href={
                                  item.type === 'til'
                                    ? `/${item.type}#${item.objectID}`
                                    : `/${item.type}/${item.objectID}`
                                }
                              >
                                <div>
                                  <H3 className="my-2 text-white dark:text-gray-300">
                                    {
                                      (item as {data: {title: string}}).data
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
