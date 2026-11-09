import cachified, { type CacheEntry } from '@epic-web/cachified'
import type * as Redis from 'redis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { redisCache } from '~/utils/redis.server'

// Only replace the external Redis transport; keep both cache adapters real.
const transport = vi.hoisted(() => ({
	isReady: true,
	connect: vi.fn(async () => {}),
	on: vi.fn(),
	json: {
		get: vi.fn<(key: string) => Promise<unknown>>(),
		set: vi.fn(async () => 'OK'),
		del: vi.fn(async () => 1),
	},
	expireAt: vi.fn(async () => 1),
}))
vi.mock('redis', async (importOriginal) => ({
	...(await importOriginal<typeof Redis>()),
	createClient: () => transport,
}))

const loadFresh = () =>
	cachified({
		key: 'home:query:1',
		cache: redisCache,
		ttl: 60_000,
		getFreshValue: async () => ({ author: 'Seneca', quote: 'Fresh quote' }),
	})

describe('Redis cache availability', () => {
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		transport.isReady = true
		transport.json.get.mockReset().mockResolvedValue(null)
		transport.json.set.mockReset().mockResolvedValue('OK')
		transport.json.del.mockReset().mockResolvedValue(1)
	})
	afterEach(() => vi.restoreAllMocks())

	it('serves fresh data when Redis reads time out', async () => {
		transport.json.get.mockRejectedValue(new Error('TimeoutError'))
		transport.json.del.mockRejectedValue(new Error('TimeoutError'))
		await expect(loadFresh()).resolves.toEqual({
			author: 'Seneca',
			quote: 'Fresh quote',
		})
	})

	it('serves fresh data when Redis writes fail', async () => {
		transport.json.set.mockRejectedValue(new Error('Connection lost'))
		await expect(loadFresh()).resolves.toEqual({
			author: 'Seneca',
			quote: 'Fresh quote',
		})
	})

	it('can discard invalid cached data even when Redis deletion fails', async () => {
		transport.json.get.mockResolvedValue({ invalid: true })
		transport.json.del.mockRejectedValue(new Error('Connection lost'))
		await expect(loadFresh()).resolves.toEqual({
			author: 'Seneca',
			quote: 'Fresh quote',
		})
	})

	it('does not wait for queued commands while Redis reconnects', async () => {
		transport.isReady = false
		transport.json.get.mockImplementation(() => new Promise(() => {}))
		await expect(loadFresh()).resolves.toEqual({
			author: 'Seneca',
			quote: 'Fresh quote',
		})
	})

	it('still serves cached data while Redis is healthy', async () => {
		const cached: CacheEntry = {
			metadata: { createdTime: Date.now(), ttl: 60_000 },
			value: { author: 'Marcus Aurelius', quote: 'Cached quote' },
		}
		transport.json.get.mockResolvedValue(cached)
		await expect(loadFresh()).resolves.toEqual({
			author: 'Marcus Aurelius',
			quote: 'Cached quote',
		})
	})
})
