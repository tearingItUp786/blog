import { type CacheEntry } from '@epic-web/cachified'
import { RouterContextProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { loader } from '~/routes/_extras.newsletter.rss[.xml]'

const entries = vi.hoisted(() => new Map<string, CacheEntry>())

// Replace only Redis I/O; exercise the real cachified and broadcast fetching.
vi.mock('~/utils/redis.server', () => ({
	redisCache: {
		get: (key: string) => entries.get(key),
		set: (key: string, entry: CacheEntry) => entries.set(key, entry),
		delete: (key: string) => entries.delete(key),
	},
}))

const broadcast = {
	id: 1,
	created_at: '2026-10-01T12:00:00Z',
	subject: 'Hello newsletter',
	description: 'A newsletter update',
	content: '<p>Hello readers</p>',
	public: true,
	published_at: '2026-10-01T12:00:00Z',
	send_at: null,
	thumbnail_alt: null,
	thumbnail_url: null,
	email_address: 'hello@example.com',
	email_layout_template: 'text',
}

const loadFeed = () =>
	loader({
		request: new Request('https://example.com/newsletter/rss.xml'),
		url: new URL('https://example.com/newsletter/rss.xml'),
		pattern: '/newsletter/rss.xml',
		params: {},
		context: new RouterContextProvider(),
	}) as Promise<Response>

function setup() {
	entries.clear()
	vi.useFakeTimers()
	vi.setSystemTime(new Date('2026-10-03T12:00:00Z'))
	vi.stubEnv('CONVERT_KIT_API', 'https://api.example.com')
	vi.stubEnv('CONVERT_KIT_API_KEY', 'test-key')
	return {
		[Symbol.dispose]() {
			vi.useRealTimers()
			vi.unstubAllGlobals()
			vi.unstubAllEnvs()
			vi.restoreAllMocks()
		},
	}
}

describe('newsletter RSS caching', () => {
	it('serves identical XML without upstream requests while the feed is fresh', async () => {
		using ignoredSetup = setup()
		const fetch = vi.fn(async (url: string) =>
			Response.json(
				url.includes('/broadcasts/1?')
					? { broadcast }
					: { broadcasts: [broadcast] },
			),
		)
		vi.stubGlobal('fetch', fetch)

		const first = await loadFeed()
		const xml = await first.text()
		expect(first.status).toBe(200)
		expect(xml).toContain('<title><![CDATA[Hello newsletter]]></title>')
		expect(xml).toContain('Hello readers')
		expect(first.headers.get('Content-Type')).toBe('application/xml')

		vi.advanceTimersByTime(59 * 60 * 1000)
		fetch.mockImplementation(async () => {
			throw new Error('Upstream must not be called for a cached feed')
		})
		const cached = await loadFeed()
		expect(cached.status).toBe(200)
		expect(await cached.text()).toBe(xml)
		expect(fetch).toHaveBeenCalledTimes(2)
		expect(first.headers.get('Cache-Control')).toBe(
			'public, max-age=300, s-maxage=300',
		)
	})

	it('regenerates the feed after one hour', async () => {
		using ignoredSetup = setup()
		let subject = 'Hello newsletter'
		vi.stubGlobal('fetch', async (url: string) =>
			Response.json(
				url.includes('/broadcasts/1?')
					? { broadcast: { ...broadcast, subject } }
					: { broadcasts: [broadcast] },
			),
		)
		expect(await (await loadFeed()).text()).toContain('Hello newsletter')

		vi.advanceTimersByTime(60 * 60 * 1000 + 1)
		subject = 'New newsletter'
		const refreshed = await loadFeed()
		expect(refreshed.status).toBe(200)
		expect(await refreshed.text()).toContain(
			'<title><![CDATA[New newsletter]]></title>',
		)
	})

	it.each(['list', 'detail'])(
		'does not cache a failed %s fetch',
		async (failure) => {
			using ignoredSetup = setup()
			vi.spyOn(console, 'error').mockImplementation(() => {})
			let shouldFail = true
			vi.stubGlobal('fetch', async (url: string) => {
				const isDetail = url.includes('/broadcasts/1?')
				if (shouldFail && isDetail === (failure === 'detail')) {
					return new Response('Unavailable', { status: 503 })
				}
				return Response.json(
					isDetail ? { broadcast } : { broadcasts: [broadcast] },
				)
			})

			const failed = await loadFeed()
			expect(failed.status).toBe(500)
			expect(failed.headers.get('Cache-Control')).toBeNull()
			shouldFail = false
			const recovered = await loadFeed()
			expect(recovered.status).toBe(200)
			expect(await recovered.text()).toContain(
				'<title><![CDATA[Hello newsletter]]></title>',
			)
		},
	)
})
