import type { ActionFunctionArgs } from 'react-router';
import {themeCookie} from '~/utils/theme.server'
import { useFetchers } from 'react-router';
import {useRequestInfo} from '~/utils/request-info'

export function useOptimisticThemeMode() {
  const fetchers = useFetchers()
  const themeFetcher = fetchers.find(
    f => f.formAction === '/action/theme-switcher',
  )

  if (themeFetcher && themeFetcher.formData) {
    return themeFetcher.formData.get('theme') as string | null
  }
}

export function useTheme() {
  const optimisticTheme = useOptimisticThemeMode()
  const requestInfo = useRequestInfo()
  let theme = optimisticTheme ?? requestInfo.userPreferences.theme
  return theme
}

export const action = async ({request}: ActionFunctionArgs) => {
  const form = await request.formData()

  const theme = form.get('theme')
  console.log('👀 theme form', theme)

  return new Response(JSON.stringify({theme}), {
    headers: {
      // Set-Cookie is signed with "n3wsecr3t"
      'Set-Cookie': await themeCookie.serialize(theme),
    },
  })
}
