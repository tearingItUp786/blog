const express = require('express')
const compression = require('compression')
const {broadcastDevReady} = require('@remix-run/node')
const {createRequestHandler} = require('@remix-run/express')
const chokidar = require('chokidar')
const path = require('path')
const morgan = require('morgan')
const {
  createMetronomeGetLoadContext,
  registerMetronome,
} = require('@metronome-sh/express')

// definitely exist by the time the dev or prod server actually runs.
const remixBuild = require('../build/index.js')

const BUILD_PATH = '../build/index.js'
const MODE = process.env.NODE_ENV

const build = remixBuild
let devBuild = build
const buildWithMetronome = registerMetronome(build)
const metronomeGetLoadContext = createMetronomeGetLoadContext(
  buildWithMetronome,
  // For Remix Blues Stack use require("../metronome.config.js") instead
  {config: require('../metronome.config.js')},
)

let app = express()
app.disable('x-powered-by')
app.use(compression())

const here = (...d) => path.join(__dirname, ...d)

const publicAbsolutePath = here('../public')

app.use(
  express.static(publicAbsolutePath, {
    maxAge: '1w',
    setHeaders(res, resourcePath) {
      const relativePath = resourcePath.replace(`${publicAbsolutePath}/`, '')
      if (
        relativePath.startsWith('fonts') ||
        relativePath.startsWith('build')
      ) {
        res.setHeader('cache-control', 'public, max-age=31536000, immutable')
      }
    },
  }),
)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.all(
  '*',
  process.env.NODE_ENV === 'development'
    ? (req, res, next) => {
        return createRequestHandler({
          build: buildWithMetronome,
          mode: process.env.NODE_ENV,
          getLoadContext: metronomeGetLoadContext,
        })(req, res, next)
      }
    : createRequestHandler({
        build: buildWithMetronome,
        mode: process.env.NODE_ENV,
        getLoadContext: metronomeGetLoadContext,
      }),
)

let port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Express server started on ${port}`)
})

if (process.env.NODE_ENV === 'development') {
  async function reloadBuild() {
    devBuild = await import(`${BUILD_PATH}?update=${Date.now()}`)
    broadcastDevReady(devBuild)
  }

  const watchPath = path.join(__dirname, BUILD_PATH).replace(/\\/g, '/')
  const watcher = chokidar.watch(watchPath, {ignoreInitial: true})
  watcher.on('all', reloadBuild)
}
