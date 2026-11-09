import { once } from 'node:events'
import { createServer, type Socket } from 'node:net'
import { createClient } from 'redis'
import { expect, it, vi } from 'vite-plus/test'

it('replaces a silent Redis connection after a cache command times out', async () => {
	const sockets = new Set<Socket>()
	let silent = false
	// A tiny RESP server acknowledges commands, then simulates a half-open
	// connection by withholding replies without closing the socket.
	const server = createServer((socket) => {
		silent = false
		sockets.add(socket)
		socket.on('close', () => sockets.delete(socket))
		socket.on('data', (chunk) => {
			if (silent) return
			const commands = chunk.toString().match(/\*\d+\r\n/g) ?? []
			for (const _command of commands) socket.write('+OK\r\n')
		})
	})
	server.listen(0, '::1')
	await once(server, 'listening')
	const address = server.address()
	if (!address || typeof address === 'string') throw new Error('Missing port')
	const client = createClient({
		commandOptions: { timeout: 100 },
		socket: { host: '::1', port: address.port, family: 6 },
	})
	client.on('error', () => {})
	const originalClient = global.primaryClient
	global.primaryClient = client
	const { redisCache } = await import('~/utils/redis.server')
	const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
	let deadline: ReturnType<typeof setTimeout> | undefined
	try {
		await client.connect()
		silent = true
		const recovered = new Promise<void>((resolve) =>
			client.once('ready', resolve),
		)
		await expect(redisCache.get('home:query:1')).resolves.toBeUndefined()
		await Promise.race([
			recovered,
			new Promise<never>((_resolve, reject) => {
				deadline = setTimeout(
					() => reject(new Error('Socket did not recover')),
					1_000,
				)
			}),
		])
		await expect(client.ping()).resolves.toBe('OK')
	} finally {
		clearTimeout(deadline)
		errorLog.mockRestore()
		global.primaryClient = originalClient
		client.destroy()
		for (const socket of sockets) socket.destroy()
		await new Promise<void>((resolve) => server.close(() => resolve()))
	}
})
