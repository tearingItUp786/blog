import 'dotenv/config'
import closeWithGrace from 'close-with-grace'

closeWithGrace(async ({err}) => {
  const {default: chalk} = await import('chalk')
  if (err) {
    console.error(chalk.red(err))
    console.error(chalk.red(err.stack))
    process.exit(1)
  }
})

async function run() {
  await import('./server/index.mjs')
  if (process.env.MOCK_API === 'true') {
    await import('./mocks/index.cjs')
  }
}

run()
