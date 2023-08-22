import {useLocation} from '@remix-run/react'

export const ScrollProgress = () => {
  const loc = useLocation()
  console.log(loc.pathname)
  const tilOrBlog = loc.pathname.match(/(blog\/.+|til)/)
  if (!tilOrBlog) return null

  return <div id="progress"></div>
}
