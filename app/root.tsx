import { scale } from '@cloudinary/url-gen/actions/resize'
import { withSentry } from '@sentry/remix'
import {
	type LinksFunction,
	type LoaderFunctionArgs,
	type MetaFunction,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useRouteError,
	useRouteLoaderData,
} from 'react-router'
import { ExternalScripts } from 'remix-utils/external-scripts'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { Footer } from './components/footer/footer'
import { LoadingRoute } from './components/loading-route'
import { Navbar } from './components/navbar'
import { ScrollProgress } from './components/scroll-progress'
import { H3 } from './components/typography'
import { redisClient } from './utils/redis.server'

import '~/tailwind.css'
import './styles/app.css'
import './styles/new-prisma-theme.css'
import { getEnv } from './utils/env.server'
import { cloudinaryInstance } from './utils/cloudinary'
import { max } from '@cloudinary/url-gen/actions/roundCorners'
import { honeypot } from './utils/honeypot.server'
import { useOptimisticThemeMode } from './routes/action.theme-switcher'
import { getThemeFromCookie } from './utils/theme.server'

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

/**
 * This is a loader function that is used to set the ENV variable
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const isFresh = new URL(request.url).searchParams.has('fresh')
	const showNewsLetter =
		true || new URL(request.url).searchParams.has('newsletter')
	const isDev = process.env.NODE_ENV === 'development'

	const theme = (await getThemeFromCookie(request)) as string

	const mobileImage = cloudinaryInstance
		.image('blog/me')
		.format('webp')
		.resize(scale().width(500).height(500))
		.backgroundColor('transparent')
		.roundCorners(max())

	if (isFresh && isDev) {
		console.log('🌱 clearing redis cache in', process.env.NODE_ENV)
		redisClient
			.flushAll()
			.then(() => console.log('🌱 flushed redis cache'))
			.catch(console.error)
	}

	return {
		ENV: getEnv(),
		requestInfo: {
			userPreferences: { theme },
		},
		newsLetterData: {
			newsletterImage: mobileImage.toURL(),
			showNewsLetter: showNewsLetter,
		},
		honeypotInputProps: await honeypot.getInputProps(),
	}
}

const Document = ({ children }: { children: React.ReactNode }) => {
	const data = useRouteLoaderData<typeof loader>('root')
	const optimisticTheme = useOptimisticThemeMode()
	const themeToUse =
		optimisticTheme ?? data?.requestInfo?.userPreferences?.theme

	return (
		<HoneypotProvider {...data?.honeypotInputProps}>
			<html lang="en" className={themeToUse} data-theme={themeToUse}>
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width,initial-scale=1" />
					<meta name="msapplication-TileColor" content="#da532c" />
					<meta name="theme-color" content="#ffffff" />
					<Meta />
					<Links />
				</head>
				<body className="flex min-h-svh flex-col bg-light-gray dark:bg-gray-100">
					<Navbar />
					<ScrollProgress />
					{children}

					{/* This is a script that is used to set the ENV variable  */}
					<script
						dangerouslySetInnerHTML={{
							__html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
						}}
					/>
					<ScrollRestoration />
					<ExternalScripts />
					<Scripts />
					<script
						async
						src="https://static.cloudflareinsights.com/beacon.min.js"
						data-cf-beacon='{"token": "667612c4eccb40caafe9cac20dbc492c"}'
					></script>
					<Footer />
				</body>
			</html>
		</HoneypotProvider>
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
		<Document>
			<div className="w-100">
				<div className="flex h-[calc(95vh_-_63.5px)] items-center bg-light-gray dark:bg-gray-100">
					<div className="mx-auto flex max-w-[500px] flex-wrap items-center justify-center overflow-hidden">
						{elementToRender}
					</div>
				</div>
			</div>
		</Document>
	)
}

const App = () => {
	return (
		<Document>
			<Outlet />
			<LoadingRoute />
		</Document>
	)
}

export default process.env.NODE_ENV === 'production' ? withSentry(App) : App
