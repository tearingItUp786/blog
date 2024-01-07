import express from 'express'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import {createRequestHandler} from '@remix-run/express'
import {installGlobals} from '@remix-run/node'
import {renameSync} from 'fs'
import path from 'path'
import morgan from 'morgan'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const here = (...d) => path.join(__dirname, ...d)

installGlobals()

let viteDevServer
if (process.env.NODE_ENV === 'production') {
  // so the weird thing with the new vite build is that if we try to do
  // node start with the server file with our custom server, node
  // complains about our package not having a type module. However,
  // if we chane it to type module, the dev server stops working
  // because it can't find the server file. So, we're going to
  // rename the file to .mjs and then import it.
  renameSync(
    here('../build/server/index.js'),
    here('../build/server/index.mjs'),
  )
  viteDevServer = undefined
} else {
  viteDevServer = await import('vite').then(vite =>
    vite.createServer({
      server: {middlewareMode: true},
    }),
  )
}

let app = express()
app.disable('x-powered-by')
app.use(compression())

const publicAbsolutePath = here('../build/client')

if (viteDevServer) {
  console.log('new build inside of viteDevServer')
  app.use(viteDevServer.middlewares)
} else {
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
}

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'))
}

app.all(
  '*',
  createRequestHandler({
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
      : await import('../build/server/index.mjs'),
  }),
)

let port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log(`󱐌 Express server started on ${port}`)
})

closeWithGrace(() => {
  return Promise.all([
    new Promise((resolve, reject) => {
      server.close(e => (e ? reject(e) : resolve('ok')))
    }),
  ])
})
