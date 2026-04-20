import { describe, expect, it } from 'vitest'
import * as inngestUtils from '~/inngest/utils'

type ScanReply = {
	cursor: number | string
	keys: string[]
}

type ScanRedisKeys = (
	redisClient: {
		scan: (
			cursor: number,
			options: { MATCH: string; COUNT: number },
		) => Promise<ScanReply>
	},
	pattern: string,
	count?: number,
) => Promise<string[]>

describe('scanRedisKeys', () => {
	it('collects keys across every scan page for a pattern', async () => {
		const scanCalls: Array<{
			cursor: number
			options: { MATCH: string; COUNT: number }
		}> = []

		const replies = new Map<number, ScanReply>([
			[
				0,
				{
					cursor: 7,
					keys: ['gql:blog:12-go-htmx-and-lit', 'gql:blog:19-a-css-refresh'],
				},
			],
			[
				7,
				{
					cursor: 0,
					keys: ['gql:blog:20-web-performance-fundamentals'],
				},
			],
		])

		const redisClient = {
			async scan(cursor: number, options: { MATCH: string; COUNT: number }) {
				scanCalls.push({ cursor, options })

				const reply = replies.get(cursor)
				if (!reply) {
					throw new Error(`Unexpected cursor: ${cursor}`)
				}

				return reply
			},
		}

		const scanRedisKeys = (inngestUtils as { scanRedisKeys?: ScanRedisKeys })
			.scanRedisKeys

		expect(scanRedisKeys).toBeTypeOf('function')

		const keys = await scanRedisKeys!(redisClient, 'gql:blog:[0-9]*')

		expect(keys).toEqual([
			'gql:blog:12-go-htmx-and-lit',
			'gql:blog:19-a-css-refresh',
			'gql:blog:20-web-performance-fundamentals',
		])
		expect(scanCalls).toEqual([
			{
				cursor: 0,
				options: { MATCH: 'gql:blog:[0-9]*', COUNT: 200 },
			},
			{
				cursor: 7,
				options: { MATCH: 'gql:blog:[0-9]*', COUNT: 200 },
			},
		])
	})
})
