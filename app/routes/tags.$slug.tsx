import { H1, H2 } from '~/components/typography'
import { getMdxIndividualTag } from '~/utils/mdx'
import { json, LoaderArgs } from '@remix-run/node'
import styles from '~/styles/til.css'
import { useLoaderData, useParams } from '@remix-run/react'
import { TilCard } from '~/components/til/til-card'
import { tilMapper } from '~/utils/til-list'
import { useMemo } from 'react'

export async function loader({ params }: LoaderArgs) {
  if (!params.slug) {
    throw new Error('No slug provided')
  }

  const data = await getMdxIndividualTag(params.slug)
  return json({ ...data })
}

export default function SingleTag() {
  const data = useLoaderData<typeof loader>()
  const params = useParams()

  let tilComponents = useMemo(
    () => data.tilList.map(tilMapper),
    [data.tilList.length]
  )

  return (
    <div className='page-container'>
      <div className='max-w-full prose prose-light dark:prose-dark'>
        <H1 className='border-b-2 w-2/3 mt-16'>
          Today I learned about... {params.slug}
        </H1>
        {tilComponents.map((til, i) => {
          const Component: any = tilComponents?.[i]?.component ?? null
          if (!til?.frontmatter) return null
          return (
            <div
              key={til.frontmatter.title}
              className='mb-20 last-of-type:mb-0 first-of-type:mt-12'
            >
              <TilCard
                key={`${til.frontmatter.title}-${til.frontmatter.date}`}
                title={til.frontmatter.title}
                date={til.frontmatter.date}
                tag={til.frontmatter.tag}
                showBlackLine={false}
              >
                {Component ? <Component /> : null}
              </TilCard>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}
