import {H1, H3} from '~/components/typography'
import {getMdxIndividualTagGql} from '~/utils/mdx'
import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {NavLink, useLoaderData, useParams} from '@remix-run/react'
import {ContentCard as GenericContentCard} from '~/components/til/content-card'
import {tilMapper} from '~/utils/til-list'
import {useMemo} from 'react'

export async function loader({params}: LoaderArgs) {
  if (!params.slug) {
    throw new Error('No slug provided')
  }

  const data = await getMdxIndividualTagGql(params.slug)
  return json({...data})
}

export default function SingleTag() {
  const {blogList, tilList} = useLoaderData<typeof loader>()
  const params = useParams()

  let tilComponents = useMemo(() => tilList.map(tilMapper), [tilList])

  return (
    <div className="mx-auto mt-[2rem] min-h-[100vh] max-w-screen-xl pb-24">
      <div
        className="
        prose 
        prose-light ml-[10vw]
        mr-[10vw]
        max-w-full dark:prose-dark xl:mx-auto
        "
      >
        <H1 className="mt-16 w-full border-b-2 dark:border-b-white">
          Today I learned about... <br />
          <span className="mt-2 block text-5xl  text-accent md:text-7xl">
            {params.slug}
          </span>
        </H1>
        <NavLink to="/tags" className="group no-underline">
          <H3 className="inline group-hover:text-accent">Back to all tags</H3>
        </NavLink>
        {tilComponents.map((til, i) => {
          const Component: any = tilComponents?.[i]?.component ?? null
          if (!til?.frontmatter) return null
          return (
            <div
              key={til.frontmatter.title}
              className="mb-20 first-of-type:mt-12 last-of-type:mb-0"
            >
              <GenericContentCard
                key={`${til.frontmatter.title}-${til.frontmatter.date}`}
                title={til.frontmatter.title}
                date={til.frontmatter.date}
                tag={til.frontmatter.tag}
                showBlackLine={false}
              >
                {Component ? <Component /> : null}
              </GenericContentCard>
            </div>
          )
        })}

        {blogList.map(blog => {
          return (
            <div
              key={blog.frontmatter.title}
              className="mb-20 first-of-type:mt-12 last-of-type:mb-0"
            >
              <NavLink className="no-underline" to={`/blog/${blog.slug ?? ''}`}>
                {/* TODO: figure how a generic component can be used here */}
                <GenericContentCard
                  key={`${blog.frontmatter.title}-${blog.frontmatter.date}`}
                  title={blog.frontmatter.title}
                  date={blog.frontmatter.date}
                  tag={blog.frontmatter.tag}
                  showBlackLine={false}
                >
                  <H3>
                    Blog post about:{' '}
                    {blog.frontmatter.subtitle ??
                      blog.frontmatter.description ??
                      'This blog entry needs a description'}
                  </H3>
                </GenericContentCard>
              </NavLink>
            </div>
          )
        })}
      </div>
    </div>
  )
}
