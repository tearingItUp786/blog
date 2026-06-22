import { describe, expect, it } from 'vitest'

import {
	hostileRequestGuard,
	isHostileProbeRequest,
} from '../../server/hostile-request-guard.mjs'

describe('hostile request guard', () => {
	it('blocks obvious CMS and executable file probes', () => {
		expect(isHostileProbeRequest({ method: 'POST', path: '/xmlrpc.php' })).toBe(
			true,
		)
		expect(isHostileProbeRequest({ method: 'GET', path: '/shell.aspx' })).toBe(
			true,
		)
		expect(
			isHostileProbeRequest({ method: 'GET', path: '/cgi-bin/status' }),
		).toBe(true)
	})

	it('blocks dotfile and sensitive file probes', () => {
		expect(isHostileProbeRequest({ method: 'GET', path: '/.env' })).toBe(true)
		expect(isHostileProbeRequest({ method: 'GET', path: '/.git/config' })).toBe(
			true,
		)
		expect(isHostileProbeRequest({ method: 'GET', path: '/%2Eenv' })).toBe(true)
	})

	it('blocks unsafe requests to arbitrary file-looking paths', () => {
		expect(isHostileProbeRequest({ method: 'POST', path: '/robots.txt' })).toBe(
			true,
		)
		expect(
			isHostileProbeRequest({ method: 'DELETE', path: '/assets/app.js' }),
		).toBe(true)
	})

	it('allows normal app routes and owned unsafe endpoints', () => {
		expect(
			isHostileProbeRequest({ method: 'GET', path: '/blog/some-post' }),
		).toBe(false)
		expect(
			isHostileProbeRequest({ method: 'GET', path: '/blog.rss.xml' }),
		).toBe(false)
		expect(
			isHostileProbeRequest({ method: 'POST', path: '/action/newsletter' }),
		).toBe(false)
		expect(
			isHostileProbeRequest({ method: 'POST', path: '/action/theme-switcher' }),
		).toBe(false)
		expect(isHostileProbeRequest({ method: 'POST', path: '/inngest' })).toBe(
			false,
		)
		expect(
			isHostileProbeRequest({ method: 'GET', path: '/tags/wordpress' }),
		).toBe(false)
		expect(isHostileProbeRequest({ method: 'GET', path: '/blog/vendor' })).toBe(
			false,
		)
	})

	it('allows React Router data requests for app routes', () => {
		expect(
			isHostileProbeRequest({ method: 'POST', path: '/_root.data?index' }),
		).toBe(false)
		expect(
			isHostileProbeRequest({
				method: 'POST',
				path: '/action/newsletter.data',
			}),
		).toBe(false)
	})

	it('still blocks hostile probes sent through React Router data URLs', () => {
		expect(
			isHostileProbeRequest({ method: 'POST', path: '/xmlrpc.php.data' }),
		).toBe(true)
		expect(isHostileProbeRequest({ method: 'POST', path: '/robots.txt' })).toBe(
			true,
		)
	})

	it('returns a clean 404 and skips downstream handlers for probes', () => {
		let statusCode = 200
		let contentType = ''
		let responseBody = ''
		let didCallNext = false
		const response = {
			status(status: number) {
				statusCode = status
				return response
			},
			type(type: string) {
				contentType = type
				return response
			},
			send(body: string) {
				responseBody = body
				return response
			},
		}

		hostileRequestGuard(
			{ method: 'POST', path: '/xmlrpc.php' },
			response,
			() => {
				didCallNext = true
			},
		)

		expect(statusCode).toBe(404)
		expect(contentType).toBe('text/plain')
		expect(responseBody).toBe('Not Found')
		expect(didCallNext).toBe(false)
	})

	it('passes normal requests to downstream handlers', () => {
		let didCallNext = false
		const response = {
			status() {
				return response
			},
			type() {
				return response
			},
			send() {
				return response
			},
		}

		hostileRequestGuard(
			{ method: 'GET', path: '/blog/some-post' },
			response,
			() => {
				didCallNext = true
			},
		)

		expect(didCallNext).toBe(true)
	})

	it('passes React Router data requests to downstream handlers', () => {
		let didCallNext = false
		const response = {
			status() {
				return response
			},
			type() {
				return response
			},
			send() {
				return response
			},
		}

		hostileRequestGuard(
			{ method: 'POST', path: '/_root.data', url: '/_root.data?index' },
			response,
			() => {
				didCallNext = true
			},
		)

		expect(didCallNext).toBe(true)
	})
})
