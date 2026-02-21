import 'dotenv/config'
import closeWithGrace from 'close-with-grace'
import { z } from 'zod'

closeWithGrace(async ({ err }) => {
	const { default: chalk } = await import('chalk')
	if (err) {
		console.error(chalk.red(err))
		console.error(chalk.red(err.stack))
		process.exit(1)
	}
})

async function run() {
	await import('./server/index.mjs')
	const isMockApiEnabled = z
		.stringbool()
		.catch(false)
		.parse(process.env.MOCK_API)
	if (isMockApiEnabled) {
		await import('./mocks/index.cjs')
	}
}

run()
