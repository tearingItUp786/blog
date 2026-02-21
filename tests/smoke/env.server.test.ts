import { describe, expect, it, vi } from 'vitest'
import { getEnv, init } from '~/utils/env.server'

const baseEnv = {
	ALGOLIA_APP_ID: 'algolia-app-id',
	ALGOLIA_ADMIN_KEY: 'algolia-admin-key',
	AMPLITUDE_INIT: 'amplitude-init',
	BOT_GRAPHQL_TOKEN: 'bot-graphql-token',
	CONVERT_KIT_API: 'convert-kit-api',
	CONVERT_KIT_API_KEY: 'convert-kit-api-key',
	CONVERT_KIT_FORM_ID: 'convert-kit-form-id',
	INNGEST_EVENT_KEY: 'inngest-event-key',
	INNGEST_SIGNING_KEY: 'inngest-signing-key',
	NODE_ENV: 'test',
	NOTIFY_TOPIC: 'notify-topic',
	REFRESH_CACHE_SECRET: 'refresh-cache-secret',
	SENTRY_AUTH_TOKEN: 'sentry-auth-token',
	SENTRY_DSN: 'https://example.ingest.sentry.io/123',
	SENTRY_ORG: 'sentry-org',
	SENTRY_PROJECT: 'sentry-project',
	BOT_ALGOLIA_TOKEN: 'bot-search-key',
} as const

const originalEnv = { ...process.env }

function resetEnv(overrides: Record<string, string | undefined> = {}) {
	for (const key of Object.keys(process.env)) {
		delete process.env[key]
	}

	Object.assign(process.env, originalEnv, baseEnv)

	for (const [key, value] of Object.entries(overrides)) {
		if (value === undefined) {
			delete process.env[key]
			continue
		}

		process.env[key] = value
	}
}

async function withEnv(
	overrides: Record<string, string | undefined>,
	run: () => void | Promise<void>,
) {
	resetEnv(overrides)

	try {
		await run()
	} finally {
		vi.restoreAllMocks()
		resetEnv()
	}
}

describe('env smoke tests', () => {
	it('passes init with valid required values', async () => {
		await withEnv(
			{
				ALGOLIA_SEARCH_KEY: 'public-search-key',
				BOT_ALGOLIA_TOKEN: undefined,
			},
			() => {
				expect(() => init()).not.toThrow()
				expect(getEnv().ALGOLIA_SEARCH_KEY).toBe('public-search-key')
			},
		)
	})

	it('uses BOT_ALGOLIA_TOKEN as fallback search key', async () => {
		await withEnv({ ALGOLIA_SEARCH_KEY: undefined }, () => {
			expect(() => init()).not.toThrow()
			expect(getEnv().ALGOLIA_SEARCH_KEY).toBe(baseEnv.BOT_ALGOLIA_TOKEN)
		})
	})

	it('fails init when both search keys are missing', async () => {
		await withEnv(
			{ ALGOLIA_SEARCH_KEY: undefined, BOT_ALGOLIA_TOKEN: undefined },
			() => {
				const consoleErrorSpy = vi
					.spyOn(console, 'error')
					.mockImplementation(() => {})

				expect(() => init()).toThrow('Invalid environment variables')
				consoleErrorSpy.mockRestore()
			},
		)
	})
})
