import {useLocation, useNavigation} from '@remix-run/react'
import {useEffect, useState} from 'react'

export const LoadingRoute = () => {
  const navigation = useNavigation()
  const loc = useLocation()
  const [showLoadingComponent, setShowLoadingComponent] = useState(true)
  const {pathname} = navigation.location ?? {}

  // This is a bit of a hack to get the loading component to show up
  // after 500 ms if the route has failed to change client side
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    if (navigation.state === 'loading' && pathname !== loc.pathname) {
      timeout = setTimeout(() => {
        setShowLoadingComponent(true)
      }, 500)
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
  }, [pathname])

  if (!showLoadingComponent || !pathname) return null

  return (
    <div
      id="toast-simple"
      className="divide-gray-700 space-x fixed bottom-0 left-0 z-50 flex w-full max-w-xl items-center space-x-4 divide-x divide-white rounded-lg bg-gray-100 p-4 text-white shadow dark:divide-gray-200 dark:bg-white dark:text-gray-200"
      role="alert"
    >
      <div
        className="text-primary inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
      <div className="pl-4 text-lg font-normal">Routing you to {pathname}</div>
    </div>
  )
}
