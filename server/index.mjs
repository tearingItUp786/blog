import {createRequestHandler} from '@remix-run/express'
import {installGlobals} from '@remix-run/node'
import * as Sentry from '@sentry/remix'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express from 'express'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const here = (...d) => path.join(__dirname, ...d)

installGlobals()

let viteDevServer
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [],
    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 100% of the transactions, reduce in production!
  })
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
          relativePath.startsWith('images') ||
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

const maxMultiple = process.env.NODE_ENV === 'development' ? 10_000 : 1

app.use(
  rateLimit({
    windowMs: 60 * 1000 * 5, // 5 minutes,
    limit: 1000 * maxMultiple, // limit each ip per window,
    standardHeaders: true, // standard rate limit headers (none of the X-stuff)
    legacyHeaders: false,
  }),
)

app.use((_req, res, next) => {
  res.set('X-Fly-Region', process.env.FLY_REGION ?? 'unknown')
  res.set('X-Fly-App', process.env.FLY_APP_NAME ?? 'unknown')

  res.set('X-Frame-Options', 'SAMEORIGIN')
  next()
})

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
