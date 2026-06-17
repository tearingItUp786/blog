import { readFileSync } from 'node:fs'
import { type Server } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const require = createRequire(import.meta.url)

type ExpressResponse = {
	sendStatus(status: number): void
}

type ExpressApp = {
	all(
		route: string,
		handler: (_req: unknown, res: ExpressResponse) => void,
	): void
	listen(port: number): Server
}

const express = require('express') as () => ExpressApp

function readProjectFile(filePath: string) {
	return readFileSync(path.join(root, filePath), 'utf8')
}

function getReactRouterCatchAllRoute() {
	const server = readProjectFile('server/index.mjs')
	const match = /app\.all\(\s*(['"])(?<route>.*?)\1/.exec(server)

	if (!match?.groups?.route) {
		throw new Error('Could not find React Router catch-all route')
	}

	return match.groups.route
}

async function listen(app: ExpressApp) {
	const server = app.listen(0)
	await new Promise<void>((resolve) => server.once('listening', resolve))
	return server
}

async function close(server: Server) {
	await new Promise<void>((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()))
	})
}

function getPort(server: Server) {
	const address = server.address()

	if (!address || typeof address === 'string') {
		throw new Error('Expected server to listen on a TCP port')
	}

	return address.port
}

async function getStatus(route: string, pathname: string) {
	const app = express()
	app.all(route, (_req, res) => res.sendStatus(204))
	const server = await listen(app)

	try {
		const response = await fetch(
			`http://127.0.0.1:${getPort(server)}${pathname}`,
		)
		return response.status
	} finally {
		await close(server)
	}
}

describe('Express catch-all route', () => {
	it('uses Express 5 wildcard syntax that catches root and nested routes', async () => {
		const route = getReactRouterCatchAllRoute()

		expect(route).toBe('/{*splat}')
		await expect(getStatus(route, '/')).resolves.toBe(204)
		await expect(getStatus(route, '/blog/example')).resolves.toBe(204)
	})
})
