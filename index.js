require('dotenv/config')
const {installGlobals} = require('@remix-run/node')
const closeWithGrace = require('close-with-grace')

// make sure globals are installed before we do anything else
// that way everything's referencing the same globals
installGlobals()

closeWithGrace(async ({err}) => {
  const {default: chalk} = await import('chalk')
  if (err) {
    console.error(chalk.red(err))
    console.error(chalk.red(err.stack))
    process.exit(1)
  }
})

async function run() {
  await import('./server/index.js')
}

run()
