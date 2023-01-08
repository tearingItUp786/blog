import React from 'react'
import { json, useLoaderData } from 'remix'
import { TilCard } from '~/components/til/til-card'
import { getMdxComponent, getMdxTilList } from '~/utils/mdx'

export async function loader() {
  const tilList = await getMdxTilList()

  return json({ tilList })
}

export default function TilPage() {
  let data = useLoaderData<typeof loader>()

  let components = React.useMemo(() => {
    return data.tilList.map((til) => {
      return {
        ...til,
        component: getMdxComponent(String(til.code)),
      }
    })
  }, [])

  return (
    <div
      className='
    ml-[18vw] mr-[10vw] pb-8 relative mt-8
    after:hidden
    after:md:block
    after:content-[""]
    after:absolute
    after:top-[10px]
    after:left-[-13vw]
    after:h-full
    after:w-[2px]
    after:bg-gray-100
    after:dark:bg-white
    '
    >
      <div className='max-w-full prose prose-light dark:prose-dark'>
        {components.map((til, i) => {
          const Component: any = components?.[i]?.component
          console.log('huh', Component)
          return (
            <TilCard
              key={til.slug}
              title={til.frontmatter.title}
              date={til.frontmatter.date}
              tag={til.frontmatter.tag}
            >
              <Component />
            </TilCard>
          )
        })}
      </div>
    </div>
  )
}
