const express = require('express')
const closeWithGrace = require('close-with-grace')
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

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'))
}

app.all('*', (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('new build inside of app all', devBuild.assets.url)
    return createRequestHandler({
      build: devBuild,
      mode: MODE,
    })(...args)
  }

  return createRequestHandler({
    build: buildWithMetronome,
    mode: MODE,
    getLoadContext: metronomeGetLoadContext,
  })
})

let port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log(`Express server started on ${port}`)

  if (process.env.NODE_ENV === 'development') {
    broadcastDevReady(build)
  }
})

closeWithGrace(() => {
  return Promise.all([
    new Promise((resolve, reject) => {
      server.close(e => (e ? reject(e) : resolve('ok')))
    }),
  ])
})

function clearRequireCache() {
  Object.keys(require.cache).forEach(function (key) {
    delete require.cache[key]
  })
}

if (process.env.NODE_ENV === 'development') {
  function reloadBuild() {
    clearRequireCache()
    devBuild = require(`../build/index.js`)
    broadcastDevReady(devBuild)
  }

  const watchPath = path.join(__dirname, BUILD_PATH).replace(/\\/g, '/')
  const watcher = chokidar.watch(watchPath, {ignoreInitial: true})
  watcher.on('all', reloadBuild)
}
