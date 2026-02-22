import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation, useNavigation } from 'react-router'
import { ToastUI } from './toast-ui'

export const LoadingRoute = () => {
	const navigation = useNavigation()
	const loc = useLocation()
	const [showLoadingComponent, setShowLoadingComponent] = useState(false)
	const { pathname } = navigation.location ?? {}

	// This is a bit of a hack to get the loading component to show up
	// after 1000 ms if the route has failed to change client side
	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | null = null
		if (navigation.state === 'loading' && pathname !== loc.pathname) {
			timeout = setTimeout(() => {
				setShowLoadingComponent(true)
			}, 300)
		}

		if (navigation.state === 'idle') {
			if (timeout) {
				clearTimeout(timeout)
			}
			setShowLoadingComponent(false)
		}

		return () => {
			if (timeout) {
				clearTimeout(timeout)
			}
		}
	}, [pathname, navigation.state, loc.pathname])

	return (
		<AnimatePresence>
			{showLoadingComponent && pathname ? (
				<ToastUI msg={`Routing you to ${pathname}`} />
			) : null}
		</AnimatePresence>
	)
}
