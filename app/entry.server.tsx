import { PassThrough } from 'stream'
import { createReadableStreamFromReadable } from '@react-router/node'
import * as Sentry from '@sentry/react-router'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { type EntryContext, ServerRouter } from 'react-router'
import { getEnv, init } from './utils/env.server'
import { NonceProvider } from './utils/nonce-provider'

const ABORT_DELAY = 5000

init()
global.ENV = getEnv()

export const handleError = Sentry.createSentryHandleError({ logErrors: false })

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext,
	// TODO: get rid of this any
	loadContext: any,
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
	// TODO: get rid of this any
	loadContext: any,
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
	// TODO: get rid of this any
	loadContext: any,
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
