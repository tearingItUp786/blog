import { PassThrough } from 'stream'
import { createReadableStreamFromReadable } from '@react-router/node'
import * as Sentry from '@sentry/react-router'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import {
	type AppLoadContext,
	type EntryContext,
	type HandleErrorFunction,
	ServerRouter,
	isRouteErrorResponse,
} from 'react-router'
import { getEnv, init } from './utils/env.server'
import { NonceProvider } from './utils/nonce-provider'

const ABORT_DELAY = 5000

type ServerLoadContext = AppLoadContext & {
	cspNonce?: string
}

init()
global.ENV = getEnv()

export const handleError: HandleErrorFunction = (error, { request }) => {
	// Don't report aborted requests (navigations cancelled mid-flight)
	if (request.signal.aborted) return

	// Don't report expected route errors (404s, etc.) — bots will constantly
	// hit non-existent paths and we don't want the noise in Sentry
	if (isRouteErrorResponse(error) && error.status < 500) return

	Sentry.captureException(error, {
		mechanism: { type: 'react-router', handled: false },
	})
}

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext,
	loadContext: ServerLoadContext,
) {
	return isbot(request.headers.get('user-agent'))
		? handleBotRequest(
				request,
				responseStatusCode,
				responseHeaders,
				reactRouterContext,
				loadContext,
			)
		: handleBrowserRequest(
				request,
				responseStatusCode,
				responseHeaders,
				reactRouterContext,
				loadContext,
			)
}

function handleBotRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext,
	loadContext: ServerLoadContext,
) {
	return new Promise((resolve, reject) => {
		let didError = false

		const nonce = loadContext.cspNonce ? String(loadContext.cspNonce) : ''
		const { pipe, abort } = renderToPipeableStream(
			<NonceProvider value={nonce}>
				<ServerRouter
					context={reactRouterContext}
					url={request.url}
					nonce={nonce}
				/>
			</NonceProvider>,
			{
				nonce,
				onAllReady() {
					const body = new PassThrough()
					const stream = createReadableStreamFromReadable(body)

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: didError ? 500 : responseStatusCode,
						}),
					)

					pipe(body)
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					didError = true
					console.error(error)
				},
			},
		)

		setTimeout(abort, ABORT_DELAY)
	})
}

function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext,
	loadContext: ServerLoadContext,
) {
	return new Promise((resolve, reject) => {
		let didError = false

		const nonce = loadContext.cspNonce ? String(loadContext.cspNonce) : ''
		const { pipe, abort } = renderToPipeableStream(
			<NonceProvider value={nonce}>
				<ServerRouter
					context={reactRouterContext}
					url={request.url}
					nonce={nonce}
				/>
			</NonceProvider>,
			{
				nonce,
				onShellReady() {
					const body = new PassThrough()
					const stream = createReadableStreamFromReadable(body)

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: didError ? 500 : responseStatusCode,
						}),
					)

					pipe(body)
				},
				onShellError(err: unknown) {
					reject(err)
				},
				onError(error: unknown) {
					didError = true
					console.error(error)
				},
			},
		)

		setTimeout(abort, ABORT_DELAY)
	})
}
