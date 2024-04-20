import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react'
import clsx from 'clsx'
import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from './utils/theme-provider'
import Toggle from '~/components/theme-toggle'
import {Navbar} from './components/navbar'
import type {LinksFunction, LoaderFunction, MetaFunction} from '@remix-run/node'
import {withSentry} from '@sentry/remix'
import {ExternalScripts} from 'remix-utils/external-scripts'

import {Footer} from './components/footer/footer'
import {H3} from './components/typography'
import {ScrollProgress} from './components/scroll-progress'
import {redisClient} from './utils/redis.server'
import {LoadingRoute} from './components/loading-route'

import '~/tailwind.css'
import './styles/app.css'
import './styles/new-prisma-theme.css'

const FAVICON = [
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/apple-touch-icon.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon-16x16.png',
  },
  {
    rel: 'manifest',
    href: '/site.webmanifest',
  },
  {
    rel: 'mask-icon',
    href: '/safari-pinned-tab.svg',
    color: '#5bbad5',
  },
]

export const meta: MetaFunction = () => {
  return [
    {
      title: `Taran "tearing it up" Bains`,
    },
    {
      name: 'description',
      content: 'A home for the mostly developer thoughts of Taran Bains',
    },
  ]
}

export const links: LinksFunction = () => {
  return [...FAVICON]
}

const Document = ({children}: {children: React.ReactNode}) => {
  const [theme] = useTheme()
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls />
      </head>
      <body className="bg-white dark:bg-gray-100">
        <Navbar />
        <ScrollProgress />
        {children}

        <ScrollRestoration />
        <ExternalScripts />
        <LiveReload />
        <Scripts />
        <Toggle />
        <Footer />
      </body>
    </html>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()
  const elementToRender = isRouteErrorResponse(error) ? (
    <>
      <H3>Not found: {error.status}</H3>
      <iframe
        title="Not Found"
        src="https://giphy.com/embed/UHAYP0FxJOmFBuOiC2"
        width="480"
        height="361"
        className="giphy-embed"
        allowFullScreen
      />

      <p className="text-pink">
        <a
          className="text-pink"
          href="https://giphy.com/gifs/gengar-jijidraws-jiji-knight-UHAYP0FxJOmFBuOiC2"
        >
          via GIPHY
        </a>
      </p>
    </>
  ) : (
    <>
      <H3>Something went wrong with the server</H3>
      <div className="relative h-0 w-[100%] pb-[56%]">
        <iframe
          title="Not sure what happened"
          src="https://giphy.com/embed/7wUn5bkB2fUBY8Jo1D"
          width="100%"
          height="100%"
          className="giphy-embed absolute"
          allowFullScreen
        ></iframe>
      </div>
      <p>
        <a href="https://giphy.com/gifs/ThisIsMashed-animation-animated-mashed-7wUn5bkB2fUBY8Jo1D">
          via GIPHY
        </a>
      </p>
    </>
  )
  return (
    <ThemeProvider>
      <Document>
        <div className="w-100">
          <div className="flex  h-[calc(95vh_-_63.5px)] items-center bg-white dark:bg-gray-100">
            <div className="mx-auto flex max-w-[500px] flex-wrap items-center justify-center overflow-hidden">
              {elementToRender}
            </div>
          </div>
        </div>
      </Document>
    </ThemeProvider>
  )
}

export const loader: LoaderFunction = async ({request}) => {
  const isFresh = new URL(request.url).searchParams.has('fresh')
  const isDev = process.env.NODE_ENV === 'development'

  if (isFresh && isDev) {
    console.log('🌱 clearing redis cache in', process.env.NODE_ENV)
    redisClient.flushAll()
  }
  return null
}

const App = () => {
  return (
    <ThemeProvider>
      <Document>
        <Outlet />
        <LoadingRoute />
      </Document>
    </ThemeProvider>
  )
}

export default process.env.NODE_ENV === 'production' ? withSentry(App) : App
