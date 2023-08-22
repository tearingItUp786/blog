import {useLocation} from '@remix-run/react'

export const ScrollProgress = () => {
  const loc = useLocation()
  const tilOrBlog = loc.pathname.match(/(blog\/.+|til)/)
  if (!tilOrBlog) return null

  return <div id="progress"></div>
}
