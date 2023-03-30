import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react'
import clsx from 'clsx'
import appStyles from './styles/app.css'

import tailwindStyles from '~/tailwind.css'
import prismaStyles from './styles/prisma-theme.css'
import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from './utils/theme-provider'
import Toggle from '~/components/theme-toggle'
import {Navbar} from './components/navbar'
import type {
  ErrorBoundaryComponent,
  LinksFunction,
  MetaFunction,
} from '@remix-run/node'
import {Footer} from './components/footer/footer'
import {H3} from './components/typography'

export const meta: MetaFunction = () => {
  return {title: `Taran "tearing it up" Bains`}
}

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: tailwindStyles},
    {rel: 'stylesheet', href: appStyles},
    {rel: 'stylesheet', href: prismaStyles},
    {rel: 'icon', href: '/favicon.ico'},
  ]
}

const CatchComponent = () => {
  const catchBoundary = useCatch()
  const [theme] = useTheme()

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls />
      </head>
      <body>
        <Navbar />
        {/* Your Error UI comes here */}
        <div className="flex  h-[calc(95vh_-_63.5px)] items-center bg-white dark:bg-gray-100">
          <div className="mx-auto flex max-w-[500px] flex-wrap items-center justify-center overflow-hidden">
            <H3>Not found: {catchBoundary.status}</H3>
            <iframe
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
          </div>
        </div>
        <Scripts />
        <Toggle />
        <Footer />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  return (
    <ThemeProvider>
      <CatchComponent />
    </ThemeProvider>
  )
}

const ErrorComponent = () => {
  const [theme] = useTheme()
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls />
      </head>
      <body>
        <Navbar />
        {/* Your Error UI comes here */}
        <div className="w-100">
          <div className="flex  h-[calc(95vh_-_63.5px)] items-center bg-white dark:bg-gray-100">
            <div className="mx-auto flex max-w-[500px] flex-wrap items-center justify-center overflow-hidden">
              <H3>Something went wrong with the server</H3>
              <div className="relative h-0 w-[100%] pb-[56%]">
                <iframe
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
            </div>
          </div>
        </div>
        <Scripts />
        <Toggle />
        <Footer />
      </body>
    </html>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({}) => {
  return (
    <ThemeProvider>
      <ErrorComponent />
    </ThemeProvider>
  )
}

const App = () => {
  const [theme] = useTheme()
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls />
      </head>
      <body className="bg-white dark:bg-gray-100">
        <Navbar />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Toggle />
        <Footer />
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}
