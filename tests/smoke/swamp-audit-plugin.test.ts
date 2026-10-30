import childProcess from 'node:child_process'
import { EventEmitter } from 'node:events'
import { Writable } from 'node:stream'
import { type Plugin } from '@opencode/plugin'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import * as pluginModule from '../../.opencode/plugins/swamp-audit'

type Context = Parameters<Plugin.Plugin['setup']>[0]
type Event = {
	tool: string
	input: unknown
	sessionID: string
	status: 'completed' | 'error'
}

async function loadPlugin() {
	const plugin = (pluginModule as unknown as { default?: Plugin.Plugin })
		.default
	expect(
		plugin,
		'OpenCode V2 requires a default plugin definition',
	).toBeDefined()
	expect(plugin?.id).toBe('swamp-audit')
	let after: ((event: Event) => Promise<void>) | undefined
	await plugin!.setup({
		session: {
			get: async () => ({ location: { directory: '/session/repo' } }),
		},
		tool: {
			hook: async (name: string, callback: typeof after) => {
				if (name === 'execute.after') after = callback
			},
		},
	} as unknown as Context)
	expect(after).toBeTypeOf('function')
	return after!
}

function captureRecorder() {
	const payloads: string[] = []
	const spawn = vi.spyOn(childProcess, 'spawn').mockImplementation(() => {
		const proc = new EventEmitter()
		const stdin = new Writable({
			write(chunk, _encoding, done) {
				payloads.push(String(chunk))
				done()
			},
			final(done) {
				done()
				queueMicrotask(() => proc.emit('close', 0))
			},
		})
		return Object.assign(proc, { stdin }) as childProcess.ChildProcess
	})
	return { payloads, spawn }
}

afterEach(() => {
	vi.restoreAllMocks()
	vi.useRealTimers()
})

describe('Swamp audit OpenCode V2 plugin', () => {
	it.each(['shell', 'bash'])(
		'records %s commands with the session location',
		async (tool) => {
			const { payloads, spawn } = captureRecorder()
			const after = await loadPlugin()
			await after({
				tool,
				input: { command: 'swamp model search --json' },
				sessionID: 'ses_test',
				status: 'completed',
			})
			expect(spawn).toHaveBeenCalledWith(
				'swamp',
				['audit', 'record', '--from-hook', '--tool', 'opencode'],
				{ cwd: '/session/repo', stdio: ['pipe', 'ignore', 'ignore'] },
			)
			expect(payloads.map((payload) => JSON.parse(payload))).toEqual([
				{
					tool_name: 'bash',
					tool_input: { command: 'swamp model search --json' },
					cwd: '/session/repo',
					session_id: 'ses_test',
				},
			])
		},
	)

	it.each([
		{ tool: 'read', input: { command: 'ignored' } },
		{ tool: 'shell', input: null },
		{ tool: 'shell', input: { command: 42 } },
		{ tool: 'shell', input: { command: '' } },
	])('ignores non-command input: %j', async (input) => {
		const { payloads } = captureRecorder()
		const after = await loadPlugin()
		await after({ ...input, sessionID: 'ses_test', status: 'completed' })
		expect(payloads).toEqual([])
	})

	it('does not interrupt tool execution when the recorder cannot start', async () => {
		vi.spyOn(childProcess, 'spawn').mockImplementation(() => {
			throw new Error('ENOENT')
		})
		const after = await loadPlugin()
		await expect(
			after({
				tool: 'shell',
				input: { command: 'swamp model search' },
				sessionID: 'ses_test',
				status: 'error',
			}),
		).resolves.toBeUndefined()
	})

	it('records concurrent commands in the same session independently', async () => {
		const { payloads } = captureRecorder()
		const after = await loadPlugin()
		await Promise.all(
			['first', 'second'].map((command) =>
				after({
					tool: 'shell',
					input: { command },
					sessionID: 'ses_test',
					status: 'completed',
				}),
			),
		)
		expect(
			payloads.map((payload) => JSON.parse(payload).tool_input.command),
		).toEqual(['first', 'second'])
	})

	it('handles asynchronous recorder failures without rejecting the hook', async () => {
		vi.spyOn(childProcess, 'spawn').mockImplementation(() => {
			const proc = new EventEmitter()
			const stdin = new Writable({
				write(_chunk, _encoding, done) {
					done(new Error('EPIPE'))
				},
			})
			queueMicrotask(() => proc.emit('error', new Error('ENOENT')))
			return Object.assign(proc, { stdin }) as childProcess.ChildProcess
		})
		const after = await loadPlugin()
		await expect(
			after({
				tool: 'shell',
				input: { command: 'example' },
				sessionID: 'ses_test',
				status: 'completed',
			}),
		).resolves.toBeUndefined()
	})

	it('kills a stalled recorder after five seconds without blocking the hook', async () => {
		vi.useFakeTimers()
		const kill = vi.fn()
		vi.spyOn(childProcess, 'spawn').mockImplementation(
			() =>
				Object.assign(new EventEmitter(), {
					stdin: new Writable({
						write(_chunk, _encoding, done) {
							done()
						},
					}),
					kill,
				}) as unknown as childProcess.ChildProcess,
		)
		const after = await loadPlugin()
		const recording = after({
			tool: 'shell',
			input: { command: 'example' },
			sessionID: 'ses_test',
			status: 'completed',
		})
		await vi.advanceTimersByTimeAsync(5000)
		await expect(recording).resolves.toBeUndefined()
		expect(kill).toHaveBeenCalledWith('SIGKILL')
	})
})
