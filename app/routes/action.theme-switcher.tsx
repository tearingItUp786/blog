import { type ActionFunctionArgs, useFetchers } from 'react-router'
import { z } from 'zod'
import { invariantResponse } from '~/utils/misc'
import { useRequestInfo } from '~/utils/request-info'
import { ThemeSchema } from '~/utils/theme' // ✅ Import from shared file
import { themeCookie } from '~/utils/theme.server'

const ThemeFormSchema = z.object({
	theme: ThemeSchema,
})

export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find(
		(f) => f.formAction === '/action/theme-switcher',
	)

	if (themeFetcher && themeFetcher.formData) {
		const theme = themeFetcher.formData.get('theme')
		const parsed = ThemeFormSchema.safeParse({ theme })
		return parsed.success ? parsed.data.theme : null
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
	const rawTheme = form.get('theme')

	const result = ThemeFormSchema.safeParse({ theme: rawTheme })

	if (!result.success) {
		return new Response(JSON.stringify({ error: 'Invalid theme value' }), {
			status: 400,
		})
	}

	const { theme } = result.data

	return new Response(JSON.stringify({ theme }), {
		headers: {
			'Set-Cookie': await themeCookie.serialize(theme),
		},
	})
}
