import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const requiredProductionKeys = [
	'ALGOLIA_ADMIN_KEY',
	'ALGOLIA_APP_ID',
	'AMPLITUDE_INIT',
	'BOT_ALGOLIA_TOKEN',
	'BOT_GRAPHQL_TOKEN',
	'CONVERT_KIT_API',
	'CONVERT_KIT_API_KEY',
	'CONVERT_KIT_FORM_ID',
	'INNGEST_EVENT_KEY',
	'INNGEST_SIGNING_KEY',
	'NOTIFY_TOPIC',
	'REFRESH_CACHE_SECRET',
	'SENTRY_AUTH_TOKEN',
	'SENTRY_DSN',
	'SENTRY_ORG',
	'SENTRY_PROJECT',
] as const

const encryptedProductionEnv = `DOTENV_PUBLIC_KEY_PRODUCTION="0306dcfba8aa08cda1c7d3bc0ce23b95e846eadabcda895180d3a64e66909799e4"

STARTUP_ENV_TEST=encrypted:BMuQ6jHvQ79ZaIQSbN8CxJn9NS8OdNryXRNM+wD6MS+R5+BFMsC0ncpkNbnGT3f7AlwrTSfBbbsDjnigIBDFmcC7e/gznAYrZ9SSOFNIl6Ofdd8XTh2zbHP4DckjmRhIx73h9nAWzBTNnw==
`
const productionPrivateKey =
	'483b714d308a5e21dfffc38e232c7e47e13c3a17522c6458d4d323f369936b55'
const loaderUrl = pathToFileURL(path.resolve('load-env.mjs')).href

async function runEnvironmentLoader(nodeEnv: 'development' | 'production') {
	const directory = await mkdtemp(path.join(tmpdir(), 'blog-dotenvx-'))

	try {
		await Promise.all([
			writeFile(path.join(directory, '.env'), 'STARTUP_ENV_TEST=development\n'),
			writeFile(
				path.join(directory, '.env.production'),
				encryptedProductionEnv,
			),
		])

		const env = { ...process.env }
		delete env.STARTUP_ENV_TEST
		env.DOTENV_CONFIG_QUIET = 'true'
		env.DOTENV_PRIVATE_KEY_PRODUCTION = productionPrivateKey
		env.NODE_ENV = nodeEnv

		return spawnSync(
			process.execPath,
			[
				'--input-type=module',
				'--eval',
				`await import(${JSON.stringify(loaderUrl)}); process.stdout.write(process.env.STARTUP_ENV_TEST ?? '')`,
			],
			{ cwd: directory, encoding: 'utf8', env },
		)
	} finally {
		await rm(directory, { recursive: true, force: true })
	}
}

describe('startup environment loading', () => {
	it('includes every production key required by server initialization', async () => {
		const productionEnv = await readFile(
			path.resolve('.env.production'),
			'utf8',
		)
		const productionKeys = new Set(
			Array.from(
				productionEnv.matchAll(/^([A-Z][A-Z0-9_]*)=/gm),
				(match) => match[1],
			),
		)

		expect(
			requiredProductionKeys.filter((key) => !productionKeys.has(key)),
		).toEqual([])
	})

	it('decrypts the production environment with one private key', async () => {
		const result = await runEnvironmentLoader('production')

		expect(result.stderr).toBe('')
		expect(result.status).toBe(0)
		expect(result.stdout).toBe('decrypted')
	})

	it('loads only .env during local development', async () => {
		const result = await runEnvironmentLoader('development')

		expect(result.stderr).toBe('')
		expect(result.status).toBe(0)
		expect(result.stdout).toBe('development')
	})
})
