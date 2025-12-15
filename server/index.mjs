import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequestHandler } from '@react-router/express'
import * as Sentry from '@sentry/remix'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
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

const MODE = process.env.NODE_ENV
if (MODE === 'development') {
	app.use(morgan('dev'))
}

if (MODE === 'production') {
	app.use(morgan('combined'))
}

const maxMultiple = MODE === 'development' ? 10_000 : 1_000

app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		limit: maxMultiple, // per IP
		standardHeaders: 'draft-8',
		legacyHeaders: false,
		// Different limits for different endpoints
		keyGenerator: (req) => `${req.ip}:${req.path.split('/')[1]}`,
	}),
)

app.use((_req, res, next) => {
	res.set('X-Fly-Region', process.env.FLY_REGION ?? 'unknown')
	res.set('X-Fly-App', process.env.FLY_APP_NAME ?? 'unknown')

	res.set('X-Frame-Options', 'SAMEORIGIN')
	next()
})

// NOTE: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
app.use((req, res, next) => {
	res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
	next()
})

app.use(
	helmet({
		crossOriginEmbedderPolicy: false,
		contentSecurityPolicy: {
			directives: {
				'connect-src': [
					...(MODE === 'development' ? ['ws:'] : []),
					"'self'",
					'https://*.algolia.net',
					'https://*.algolianet.com',
				].filter(Boolean),
				'font-src': ["'self'"],
				'frame-src': [
					"'self'",
					'giphy.com',
					'www.giphy.com',
					'youtube.com',
					'www.youtube.com',
					'youtu.be',
					'youtube-nocookie.com',
					'www.youtube-nocookie.com',
					'platform.twitter.com',
					'twitter.com',
					'x.com',
				],
				'img-src': [
					"'self'",
					'data:',
					'res.cloudinary.com',
					'giphy.com',
					...(MODE === 'development' ? ['cloudflare-ipfs.com'] : []),
				],
				'media-src': ["'self'", 'res.cloudinary.com', 'data:', 'blob:'],
				'script-src': [
					"'strict-dynamic'",
					"'unsafe-eval'",
					"'self'",
					(req, res) => `'nonce-${res.locals.cspNonce}'`,
				],
				'script-src-attr': [
					"'unsafe-inline'",
					// TODO: figure out how to make the nonce work instead of
					// unsafe-inline. I tried adding a nonce attribute where we're using
					// inline attributes, but that didn't work. I still got that it
					// violated the CSP.
				],
				'upgrade-insecure-requests': null,
			},
		},
	}),
)

app.all(
	'*',
	createRequestHandler({
		build: viteDevServer
			? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
			: await import('../build/server/index.js'),
		getLoadContext(req, res) {
			return { cspNonce: res.locals.cspNonce }
		},
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
