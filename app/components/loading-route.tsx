import {useEffect, useState} from 'react'
import {useLocation, useNavigation} from 'react-router'
import {ToastUI} from './toast-ui'

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

  return <ToastUI msg={`Routing you to ${pathname}`} />
}
