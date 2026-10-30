// Swamp audit plugin for OpenCode
// Records shell tool invocations for the swamp audit timeline (OpenCode V2).
// Locally ported: swamp upgrade may replace this file with its managed template.

import childProcess from 'node:child_process'
import { Plugin } from '@opencode/plugin'

export default Plugin.define({
	id: 'swamp-audit',
	async setup(ctx) {
		await ctx.tool.hook('execute.after', async (event) => {
			if (event.tool !== 'shell' && event.tool !== 'bash') return
			if (!event.input || typeof event.input !== 'object') return
			const command = (event.input as { command?: unknown }).command
			if (typeof command !== 'string' || !command || !event.sessionID) return

			try {
				const session = await ctx.session.get({ sessionID: event.sessionID })
				const directory = session.location.directory
				const payload = JSON.stringify({
					// Swamp's hook parser still expects the bash tool name.
					tool_name: 'bash',
					tool_input: { command },
					cwd: directory,
					session_id: event.sessionID,
				})
				await new Promise<void>((resolve) => {
					const proc = childProcess.spawn(
						'swamp',
						['audit', 'record', '--from-hook', '--tool', 'opencode'],
						{ cwd: directory, stdio: ['pipe', 'ignore', 'ignore'] },
					)
					const timer = setTimeout(() => {
						proc.kill('SIGKILL')
						resolve()
					}, 5000)
					const finish = () => {
						clearTimeout(timer)
						resolve()
					}
					proc.once('error', finish)
					proc.once('close', finish)
					proc.stdin.on('error', () => {})
					proc.stdin.end(payload)
				})
			} catch {
				// Auditing must never break tool execution.
			}
		})
	},
})
