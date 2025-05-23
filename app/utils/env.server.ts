import { z } from 'zod'

const schema = z.object({
	ALGOLIA_APP_ID: z.string(),
	ALGOLIA_ADMIN_KEY: z.string(),
	AMPLITUDE_INIT: z.string(),
	BOT_GITHUB_TOKEN: z.string(),
	BOT_ALGOLIA_TOKEN: z.string(),
	CONVERT_KIT_API: z.string(),
	CONVERT_KIT_API_KEY: z.string(),
	CONVERT_KIT_FORM_ID: z.string(),
	MOCK_API: z.enum(['true', 'false'] as const).default('false'),
	NODE_ENV: z.enum(['production', 'development', 'test'] as const),
	NOTIFY_TOPIC: z.string(),
	INNGEST_EVENT_KEY: z.string(),
	INNGEST_SIGNING_KEY: z.string(),
	PORT: z.string().default('8080'),
	REDIS_PASSWORD: z.string().default(''),
	REDIS_HOST: z.string().default('localhost'),
	REDIS_PORT: z.string().default('6379'),
	REFRESH_CACHE_SECRET: z.string(),
	SENTRY_AUTH_TOKEN: z.string(),
	SENTRY_ORG: z.string(),
	SENTRY_DSN: z.string(),
	SENTRY_PROJECT: z.string(),
})

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof schema> {}
	}
}

export function init() {
	const parsed = schema.safeParse(process.env)

	if (parsed.success === false) {
		console.error(
			'❌ Invalid environment variables:',
			parsed.error.flatten().fieldErrors,
		)

		throw new Error('Invalid environment variables')
	}
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
	return {
		MODE: process.env.NODE_ENV,
		SENTRY_DSN: process.env.SENTRY_DSN,
		AMPLITUDE_INIT: process.env.AMPLITUDE_INIT,
		CONVERT_KIT_FORM_ID: process.env.CONVERT_KIT_FORM_ID,
	}
}

type ENV = ReturnType<typeof getEnv>

declare global {
	var ENV: ENV
	interface Window {
		ENV: ENV
	}
}
