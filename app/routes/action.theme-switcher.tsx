import { type ActionFunctionArgs, useFetchers } from 'react-router'
import { useRequestInfo } from '~/utils/request-info'
import { themeCookie } from '~/utils/theme.server'

export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find(
		(f) => f.formAction === '/action/theme-switcher',
	)

	if (themeFetcher && themeFetcher.formData) {
		return themeFetcher.formData.get('theme') as string | null
	}
}

export function useTheme() {
	const optimisticTheme = useOptimisticThemeMode()
	const requestInfo = useRequestInfo()
	const theme = optimisticTheme ?? requestInfo.userPreferences.theme
	return theme
}

export const action = async ({ request }: ActionFunctionArgs) => {
	const form = await request.formData()

	const theme = form.get('theme')

	return new Response(JSON.stringify({ theme }), {
		headers: {
			'Set-Cookie': await themeCookie.serialize(theme),
		},
	})
}
