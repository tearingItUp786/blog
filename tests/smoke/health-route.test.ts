import { describe, expect, it } from 'vite-plus/test'
import { loader } from '~/routes/health'

describe('health route smoke tests', () => {
	it('returns an ok status payload', async () => {
		await expect(loader()).resolves.toEqual({ status: 'ok' })
	})
})
