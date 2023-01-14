import { H1 } from '~/components/typography'
import { getMdxIndividualTag } from '~/utils/mdx'
import { json, LoaderArgs } from '@remix-run/node'
import styles from '~/styles/til.css'
import { useLoaderData } from '@remix-run/react'

export async function loader({ params }: LoaderArgs) {
  if (!params.slug) {
    throw new Error('No slug provided')
  }

  const data = await getMdxIndividualTag(params.slug)
  return json({ data })
}

export default function SingleTag() {
  const data = useLoaderData<typeof loader>()
  console.log('why', data)
  return (
    <div className='page-container'>
      <H1>A Single Tag</H1>
    </div>
  )
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}
