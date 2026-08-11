import { readFileSync } from 'node:fs'
import path from 'node:path'
import { RouterContextProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import {
	createRequestContext,
	cspNonceContext,
} from '~/utils/request-context.server.mjs'

describe('request context', () => {
	it('provides the CSP nonce through a RouterContextProvider', () => {
		const context = createRequestContext('nonce-value')

		expect(context).toBeInstanceOf(RouterContextProvider)
		expect(context.get(cspNonceContext)).toBe('nonce-value')
	})

	it('uses the provider for the Express load context', () => {
		const server = readFileSync(
			path.join(process.cwd(), 'server/index.mjs'),
			'utf8',
		)

		expect(server).toContain('return createRequestContext(res.locals.cspNonce)')
	})
})
