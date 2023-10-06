import {startTransition, StrictMode, useEffect} from 'react'
import {hydrateRoot} from 'react-dom/client'
import * as Sentry from '@sentry/remix'
import {useLocation, useMatches, RemixBrowser} from '@remix-run/react'

Sentry.init({
  dsn: 'https://4e34045e065e0a3ef57135ae5020f388@o4506001960468480.ingest.sentry.io/4506001960599552',
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        useEffect,
        useLocation,
        useMatches,
      ),
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>,
    )
  })
}

if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(hydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1)
}
