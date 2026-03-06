import { ipKeyGenerator } from 'express-rate-limit'
import { describe, expect, it } from 'vitest'
import { rateLimitKeyGenerator } from '../../server/rate-limit-key-generator.mjs'

describe('rate limit keyGenerator', () => {
	it('appends first path segment to an IPv4 address', () => {
		expect(
			rateLimitKeyGenerator({ ip: '1.2.3.4', path: '/blog/some-post' }),
		).toBe('1.2.3.4:blog')
	})

	it('masks IPv6 addresses in the same /56 subnet to the same key', () => {
		// Both addresses share the same /56 prefix (0123:4567:89ab:cd00::/56)
		// so they should be grouped as the same client after masking
		const key1 = rateLimitKeyGenerator({
			ip: '0123:4567:89ab:cd11:1111:1111:1111:1111',
			path: '/til/note',
		})
		const key2 = rateLimitKeyGenerator({
			ip: '0123:4567:89ab:cd22:2222:2222:2222:2222',
			path: '/til/note',
		})
		expect(key1).toBe(key2)
	})

	it('keeps IPv6 addresses in different /56 subnets distinct', () => {
		// These two differ in the bits above the /56 boundary
		const key1 = rateLimitKeyGenerator({
			ip: '0123:4567:89ab:cd00:1111:1111:1111:1111',
			path: '/blog/foo',
		})
		const key2 = rateLimitKeyGenerator({
			ip: '0123:4567:89ab:ee00:1111:1111:1111:1111',
			path: '/blog/foo',
		})
		expect(key1).not.toBe(key2)
	})

	it('keeps different path segments distinct for the same IP', () => {
		const key1 = rateLimitKeyGenerator({ ip: '1.2.3.4', path: '/blog/foo' })
		const key2 = rateLimitKeyGenerator({ ip: '1.2.3.4', path: '/til/bar' })
		expect(key1).not.toBe(key2)
		expect(key1).toBe('1.2.3.4:blog')
		expect(key2).toBe('1.2.3.4:til')
	})

	it('handles root path producing an empty path segment', () => {
		expect(rateLimitKeyGenerator({ ip: '1.2.3.4', path: '/' })).toBe('1.2.3.4:')
	})

	it('delegates IPv6 masking to ipKeyGenerator', () => {
		const ip = '0123:4567:89ab:cd11:1111:1111:1111:1111'
		const key = rateLimitKeyGenerator({ ip, path: '/blog/post' })
		expect(key).toBe(`${ipKeyGenerator(ip)}:blog`)
	})
})
