import {ActionFunctionArgs, json} from '@remix-run/node'
import {themeCookie} from '~/utils/theme.server'
import {useFetchers} from '@remix-run/react'
import {useRequestInfo} from '~/utils/request-info'

export function useTheme() {
  const optimisticTheme = useOptimisticThemeMode()
  const requestInfo = useRequestInfo()
  let theme = optimisticTheme ?? requestInfo.userPreferences.theme
  return theme
}

export function useOptimisticThemeMode() {
  const fetchers = useFetchers()
  const themeFetcher = fetchers.find(
    f => f.formAction === '/action/theme-switcher',
  )

  if (themeFetcher && themeFetcher.formData) {
    return themeFetcher.formData.get('theme') as string | null
  }
}

// TODO: do workshop on Zod that Kent has
export const action = async ({request}: ActionFunctionArgs) => {
  const form = await request.formData()

  const theme = form.get('theme')

  return json(
    {
      success: true,
    },
    {
      headers: {
        'Set-Cookie': await themeCookie.serialize(theme),
      },
    },
  )
}
