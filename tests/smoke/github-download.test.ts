import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { downloadDirGql } from '~/utils/github.server'

const directory = {
	repository: {
		object: {
			entries: [
				{ name: '2026-11-09-example.mdx', object: { text: '# A TIL' } },
			],
		},
	},
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('GitHub directory downloads', () => {
	it.each([502, 503, 504])(
		'recovers from a temporary HTTP %i',
		async (status) => {
			let attempts = 0
			vi.stubGlobal('fetch', async () => {
				attempts++
				return attempts === 1
					? new Response('Temporary upstream failure', { status })
					: Response.json({ data: directory })
			})

			expect(await downloadDirGql('content/til')).toEqual(directory)
		},
	)

	it('stops after three attempts when GitHub remains unavailable', async () => {
		let attempts = 0
		vi.stubGlobal('fetch', async () => {
			attempts++
			return new Response('Bad Gateway', { status: 502 })
		})

		await expect(downloadDirGql('content/til')).rejects.toMatchObject({
			status: 502,
		})
		expect(attempts).toBe(3)
	})

	it.each([401, 403, 404, 429])('does not retry HTTP %i', async (status) => {
		let attempts = 0
		vi.stubGlobal('fetch', async () => {
			attempts++
			return new Response('Request rejected', { status })
		})

		await expect(downloadDirGql('content/til')).rejects.toMatchObject({
			status,
		})
		expect(attempts).toBe(1)
	})

	it('does not turn invalid content into an empty directory', async () => {
		vi.stubGlobal('fetch', async () => Response.json({ data: {} }))
		await expect(downloadDirGql('content/til')).rejects.toThrow()
	})
})
