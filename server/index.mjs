import path from 'path'
import { fileURLToPath } from 'url'
import { createRequestHandler } from '@react-router/express'
import * as Sentry from '@sentry/remix'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express from 'express'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const here = (...d) => path.join(__dirname, ...d)

let viteDevServer = undefined
if (process.env.NODE_ENV === 'production') {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		integrations: [],
		// Performance Monitoring
		tracesSampleRate: 0.1, // Capture 100% of the transactions, reduce in production!
	})
} else {
	viteDevServer = await import('vite').then((vite) =>
		vite.createServer({
			server: { middlewareMode: true },
		}),
	)
}

let app = express()

app.disable('x-powered-by')
app.use(compression())

const publicAbsolutePath = here('../build/client')

if (viteDevServer) {
	app.use(viteDevServer.middlewares)
	app.use(express.static(publicAbsolutePath, { maxAge: '1h' }))
} else {
	app.use(
		express.static(publicAbsolutePath, {
			maxAge: '1y',
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
		windowMs: 5 * 60 * 1000, // 5 minutes
		limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
		standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
		ipv6Subnet: 60, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
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
			? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
			: await import('../build/server/index.js'),
	}),
)

let port = process.env.PORT || 3000

const server = app.listen(port, () => {
	console.log(`󱐌 Express server started on ${port}`)
})

closeWithGrace(() => {
	return Promise.all([
		new Promise((resolve, reject) => {
			server.close((e) => (e ? reject(e) : resolve('ok')))
		}),
	])
})
