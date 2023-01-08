import { json, useLoaderData } from 'remix'
import { TilCard } from '~/components/til/til-card'
import { getMdxTilList } from '~/utils/mdx'

export async function loader() {
  const tilList = await getMdxTilList()

  return json({ tilList })
}

export default function TilPage() {
  let data = useLoaderData<typeof loader>()
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
      <TilCard
        title='TIL: How to use the new React JSX transform'
        date='2021-03-01'
        tag='react'
        // some random paragraph description
        description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Done porttitor efficitur pellentesque. Nullam
aliquam turpis a condimentum lobortis. Nam posuere leo vel magna maximus.'
      />
      <TilCard
        title='TIL: How to use the new React JSX transform'
        date='2021-03-01'
        tag='react'
        // some random paragraph description
        description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Done porttitor efficitur pellentesque. Nullam
aliquam turpis a condimentum lobortis. Nam posuere leo vel magna maximus.'
      />
      <TilCard
        title='TIL: How to use the new React JSX transform'
        date='2021-03-01'
        tag='react'
        // some random paragraph description
        description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Done porttitor efficitur pellentesque. Nullam
aliquam turpis a condimentum lobortis. Nam posuere leo vel magna maximus.'
      />
      <TilCard
        title='TIL: How to use the new React JSX transform'
        date='2021-03-01'
        tag='react'
        // some random paragraph description
        description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Done porttitor efficitur pellentesque. Nullam
aliquam turpis a condimentum lobortis. Nam posuere leo vel magna maximus.'
      />
      <TilCard
        title='TIL: How to use the new React JSX transform'
        date='2021-03-01'
        tag='react'
        // some random paragraph description
        description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Done porttitor efficitur pellentesque. Nullam
aliquam turpis a condimentum lobortis. Nam posuere leo vel magna maximus.'
      />
      <TilCard
        title='TIL: How to use the new React JSX transform'
        date='2021-03-01'
        tag='react'
        // some random paragraph description
        description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Done porttitor efficitur pellentesque. Nullam
aliquam turpis a condimentum lobortis. Nam posuere leo vel magna maximus.'
      />
    </div>
  )
}
