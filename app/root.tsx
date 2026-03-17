import { scale } from '@cloudinary/url-gen/actions/resize'
import { max } from '@cloudinary/url-gen/actions/roundCorners'
import * as Sentry from '@sentry/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
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
	Link,
} from 'react-router'
import { ExternalScripts } from 'remix-utils/external-scripts'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { Footer } from './components/footer/footer'
import { LoadingRoute } from './components/loading-route'
import { Navbar } from './components/navbar'
import { ScrollProgress } from './components/scroll-progress'
import { H3 } from './components/typography'
import { useOptimisticThemeMode } from './routes/action.theme-switcher'
import { cloudinaryInstance } from './utils/cloudinary'
import { getEnv } from './utils/env.server'
import { honeypot } from './utils/honeypot.server'
import { useNonce } from './utils/nonce-provider'
import { redisClient } from './utils/redis.server'
import { getThemeFromCookie } from './utils/theme.server'

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
	return [
		...FAVICON,
		{
			rel: 'preload',
			href: '/fonts/CommitMono-400-Regular.otf',
			as: 'font',
			type: 'font/otf',
			crossOrigin: 'anonymous',
		},
		{
			rel: 'preload',
			href: '/fonts/CommitMono-700-Italic.otf',
			as: 'font',
			type: 'font/otf',
			crossOrigin: 'anonymous',
		},
		{
			rel: 'preload',
			href: '/fonts/CommitMono-700-Regular.otf',
			as: 'font',
			type: 'font/otf',
			crossOrigin: 'anonymous',
		},
	]
}

/**
 * This is a loader function that is used to set the ENV variable
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const isFresh = new URL(request.url).searchParams.has('fresh')
	const isDev = process.env.NODE_ENV === 'development'

	const theme = (await getThemeFromCookie(request)) as string

	// Image name
	const imageId = 'blog/me'

	// Base size for 1x render
	const baseWidth = 150
	const baseHeight = 150

	// 1x image
	const image1x = cloudinaryInstance
		.image(imageId)
		.format('webp')
		.resize(scale().width(baseWidth).height(baseHeight))
		.backgroundColor('transparent')
		.roundCorners(max())
		.toURL()

	// 2x image
	const image2x = cloudinaryInstance
		.image(imageId)
		.format('webp')
		.resize(
			scale()
				.width(baseWidth * 2)
				.height(baseHeight * 2),
		)
		.backgroundColor('transparent')
		.roundCorners(max())
		.toURL()

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
			newsletterImage: {
				src: image1x,
				srcSet: `${image1x} 1x, ${image2x} 2x`,
				width: 150,
				height: 150,
			},
		},
		honeypotInputProps: await honeypot.getInputProps(),
	}
}

const Document = ({ children }: { children: React.ReactNode }) => {
	const data = useRouteLoaderData<typeof loader>('root')
	const nonce = useNonce()
	const optimisticTheme = useOptimisticThemeMode()
	const themeToUse =
		optimisticTheme ?? data?.requestInfo?.userPreferences?.theme

	useEffect(() => {
		console.log(
			`%c
  ████████╗ █████╗ ██████╗  █████╗ ███╗   ██╗
  ╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗████╗  ██║
     ██║   ███████║██████╔╝███████║██╔██╗ ██║
     ██║   ██╔══██║██╔══██╗██╔══██║██║╚██╗██║
     ██║   ██║  ██║██║  ██║██║  ██║██║ ╚████║
     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
`,
			'color: #EB36A1; font-family: monospace;',
		)
		console.log(
			'%cDigging around in the console? We might become best friends. 🤝\n',
			'color: #EB36A1; font-size: 14px; font-family: monospace;',
		)
	}, [])

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
				<body className="bg-light-gray dark:bg-dark-gray-100 flex min-h-svh flex-col">
					<Navbar />
					<ScrollProgress />
					{children}

					{/* This is a script that is used to set the ENV variable  */}
					<script
						nonce={nonce}
						suppressHydrationWarning
						dangerouslySetInnerHTML={{
							__html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
						}}
					/>
					<ScrollRestoration nonce={nonce} />
					<ExternalScripts />
					<Scripts nonce={nonce} />
					<script
						nonce={nonce}
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

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.1,
		},
	},
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
	},
}

export const ErrorBoundary = () => {
	const error = useRouteError()
	if (!isRouteErrorResponse(error)) {
		Sentry.captureException(error)
	}

	const nonce = useNonce()
	const prefersReducedMotion = useReducedMotion()

	const elementToRender = isRouteErrorResponse(error) ? (
		<motion.div
			variants={prefersReducedMotion ? undefined : containerVariants}
			initial={prefersReducedMotion ? false : 'hidden'}
			animate="visible"
			className="flex flex-wrap items-center justify-center"
		>
			<motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
				<H3>Not found: {error.status}</H3>
			</motion.div>
			<motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
				<iframe
					nonce={nonce}
					title="Not Found"
					src="https://giphy.com/embed/UHAYP0FxJOmFBuOiC2"
					width="480"
					height="361"
					className="giphy-embed"
					allowFullScreen
				/>
			</motion.div>
			<motion.div
				variants={prefersReducedMotion ? undefined : itemVariants}
				className="text-accent"
			>
				<a
					className="text-accent"
					href="https://giphy.com/gifs/gengar-jijidraws-jiji-knight-UHAYP0FxJOmFBuOiC2"
				>
					via GIPHY
				</a>
			</motion.div>
			<motion.div
				variants={prefersReducedMotion ? undefined : itemVariants}
				className="mt-4 flex basis-full justify-center"
			>
				<Link
					to="/"
					className="text-accent decoration-accent hover:text-pink underline underline-offset-4 transition-colors"
				>
					Take me home
				</Link>
			</motion.div>
		</motion.div>
	) : (
		<motion.div
			variants={prefersReducedMotion ? undefined : containerVariants}
			initial={prefersReducedMotion ? false : 'hidden'}
			animate="visible"
			className="flex flex-wrap items-center justify-center"
		>
			<motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
				<H3>Something went wrong with the server</H3>
			</motion.div>
			<motion.div
				variants={prefersReducedMotion ? undefined : itemVariants}
				className="relative h-0 w-full pb-[56%]"
			>
				<iframe
					nonce={nonce}
					title="Not sure what happened"
					src="https://giphy.com/embed/7wUn5bkB2fUBY8Jo1D"
					width="100%"
					height="100%"
					className="giphy-embed absolute"
					allowFullScreen
				></iframe>
			</motion.div>
			<motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
				<a href="https://giphy.com/gifs/ThisIsMashed-animation-animated-mashed-7wUn5bkB2fUBY8Jo1D">
					via GIPHY
				</a>
			</motion.div>
			<motion.div
				variants={prefersReducedMotion ? undefined : itemVariants}
				className="mt-4 flex basis-full justify-center"
			>
				<Link
					to="/"
					className="text-accent decoration-accent hover:text-pink underline underline-offset-4 transition-colors"
				>
					Take me home
				</Link>
			</motion.div>
		</motion.div>
	)
	return (
		<Document>
			<div className="w-screen">
				<div className="bg-light-gray dark:bg-dark-gray-100 flex h-[calc(95vh-63.5px)] items-center">
					<div className="mx-auto flex max-w-125 flex-wrap items-center justify-center overflow-hidden">
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

export default App
