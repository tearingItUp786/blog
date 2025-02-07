import {useRouteLoaderData} from 'react-router'
import {invariantResponse} from './misc'
import {type loader as rootLoader} from '~/root'

export function useRequestInfo() {
  const data = useRouteLoaderData<typeof rootLoader>('root')
  invariantResponse(data?.requestInfo, 'No requestInfo found in root loader')

  return data.requestInfo
}

export function useNewsLetterData() {
  const data = useRouteLoaderData<typeof rootLoader>('root')
  invariantResponse(
    data?.newsLetterData?.newsletterImage,
    'No newsletterImage found in root loader',
  )

  return data?.newsLetterData
}
