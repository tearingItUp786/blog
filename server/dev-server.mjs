import closeWithGrace from 'close-with-grace'

async function run() {
	if (process.env.NODE_ENV === 'production') {
		await import('../index.mjs')
	} else {
		/**
		 * So this handy little thing here is basically to compile the mocks into a format
		 * that can be handled by our index.mjs files.
		 *
		 * It's a bit of a hack, but it works.
		 */
		console.log('👀 Starting dev server')
		const { execa } = await import('execa')

		const compileCommand = `esbuild index.ts --outfile=index.cjs --bundle  --platform=node  --format=cjs --target=es2020`

		console.log('🔨 Compiling mock files')
		await execa(compileCommand, {
			stdio: ['ignore', 'inherit', 'inherit'],
			cwd: 'mocks',
			shell: true,
			env: {
				FORCE_COLOR: true,
				MOCKS: true,
				...process.env,
			},
			// https://github.com/sindresorhus/execa/issues/433
			windowsHide: false,
		})

		// this command just watches for changes and restarts the server
		const command =
			'tsx watch --clear-screen=false --ignore "vite**" --ignore "app/**" --ignore "build/**" --ignore "node_modules/**" ./index.mjs'
		const devProcess = execa(command, {
			stdio: ['ignore', 'inherit', 'inherit'],
			shell: true,
			env: {
				FORCE_COLOR: true,
				MOCKS: true,
				...process.env,
			},
			// https://github.com/sindresorhus/execa/issues/433
			windowsHide: false,
		})

		closeWithGrace(async () => {
			if (devProcess.exitCode !== null || devProcess.killed) {
				return
			}

			devProcess.kill('SIGTERM', { forceKillAfterTimeout: 2000 })

			try {
				await devProcess
			} catch {
				// ignore expected termination errors during shutdown
			}
		})

		try {
			await devProcess
		} catch (error) {
			if (
				error &&
				typeof error === 'object' &&
				('signal' in error || 'isCanceled' in error) &&
				(error.signal === 'SIGINT' ||
					error.signal === 'SIGTERM' ||
					error.isCanceled === true)
			) {
				return
			}

			throw error
		}
	}
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
