import { createContext, RouterContextProvider } from 'react-router'

const registryKey = Symbol.for('new-blog.request-context')

// Native Node and Vite SSR evaluate this module in separate module graphs.
/** @type {{ cspNonceContext: import('react-router').RouterContext<string> }} */
const registry = (globalThis[registryKey] ??= {
	cspNonceContext: createContext(),
})

export const cspNonceContext = registry.cspNonceContext

/** @param {string} cspNonce */
export function createRequestContext(cspNonce) {
	const context = new RouterContextProvider()
	context.set(cspNonceContext, cspNonce)
	return context
}
