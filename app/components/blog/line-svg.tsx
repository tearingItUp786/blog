import {NavLink} from '@remix-run/react'
import React from 'react'
import {dotFormattedDate} from '~/utils/misc'

type Props = {
  date: string
  tag: string
  [key: string]: any
}

export const LineSvg = ({date, tag, ...rest}: Props) => {
  const [clientHeight, setClientHeight] = React.useState(0)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientHeight(window.document.body.clientHeight)
    }
  }, [clientHeight])

  let formattedDate = dotFormattedDate(date)

  return (
    <>
      <div className="absolute left-[-150px] top-[40px] hidden lg:block">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          style={{
            fillRule: 'evenodd',
            clipRule: 'evenodd',
            strokeMiterlimit: 10,
          }}
          viewBox="0 0 1549 7177"
          height="100%"
          width="100%"
          {...rest}
        >
          <g transform="scale(.84813 4.01135)">
            <path
              d="M0 0h1825.73v1789.02H0z"
              style={{
                fill: 'none',
              }}
            />
            <clipPath id="a">
              <path d="M0 0h1825.73v1789.02H0z" />
            </clipPath>
            <g clipPath="url(#a)">
              <text
                x={167.295}
                y={171.903}
                style={{
                  fontFamily: '&quot',
                  fontWeight: 500,
                  fontSize: '23.949px',
                  fill: '#ff00a4',
                }}
                transform="matrix(4.91278 0 0 1.03872 0 -128.939)"
              >
                {formattedDate}
              </text>
              <NavLink to={`/tags/${tag}`}>
                <text
                  x={169.294}
                  y={199.466}
                  style={{
                    fontFamily: '&quot',
                    fontWeight: 700,
                    fontSize: '23.949px',
                    fill: '#ff00a4',
                    textTransform: 'uppercase',
                  }}
                  transform="matrix(4.91278 0 0 1.03872 0 -128.939)"
                >
                  {tag}
                </text>
              </NavLink>
              <path
                d="M-11.158-11.159c-6.163 0-11.159 4.996-11.159 11.159 0 6.162 4.996 11.158 11.159 11.158S0 6.162 0 0c0-6.163-4.995-11.159-11.158-11.159"
                className="fill-gray-300 dark:fill-white"
                style={{
                  fillRule: 'nonzero',
                }}
                transform="matrix(0 -1.03872 -4.91278 0 723.888 27.844)"
              />
              <path
                d="M0-1698.74h-46.43"
                className="stroke-gray-300 dark:stroke-white"
                style={{
                  fill: 'none',
                  fillRule: 'nonzero',
                  strokeWidth: 2,
                }}
                transform="matrix(4.91278 0 0 1.03872 723.893 1803.953)"
              />
            </g>
          </g>
        </svg>
      </div>
      <div className="absolute left-[-69px] top-[70px] hidden h-[calc(100%-30px)] w-[2px] bg-black dark:bg-white lg:block"></div>
    </>
  )
}
