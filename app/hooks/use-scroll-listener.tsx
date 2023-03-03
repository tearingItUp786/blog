import React from 'react'

type Args = {
  onScroll: () => void
}
export function useScrollListener({onScroll}: Args) {
  React.useEffect(() => {
    // Avoid running during SSR
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', onScroll)
    }

    // Clean up
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [onScroll])
}
