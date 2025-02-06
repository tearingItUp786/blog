import { useRouteLoaderData } from 'react-router';
import {type loader as rootLoader} from '~/root'
import {invariantResponse} from './misc'

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
