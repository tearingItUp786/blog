import {RemixBrowser} from '@remix-run/react'
import {StrictMode, startTransition} from 'react'
import {hydrateRoot} from 'react-dom/client'

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
  void import('./utils/monitoring.client.tsx').then(({init}) => init())
}

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
