import {twMerge} from 'tailwind-merge'

type CalloutProps = {
  type: 'alert' | 'info' | 'success' | 'warning'
  title: string
  description: string
}

const cssClasses = {
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-black',
  alert: 'bg-alert text-white',
} as const

const IconMap: Record<keyof typeof cssClasses, React.ReactNode> = {
  info: (
    <>
      <circle cx={27.338} cy={27.322} r={27} fill="#fff" />
      <path
        className="fill-info"
        fillRule="evenodd"
        d="M24.552 15.675c0 1.002.354 1.867 1.056 2.569l.013.012c.733.672 1.634 1.003 2.678 1.003 1.067 0 1.974-.33 2.684-1.01.731-.7 1.103-1.566 1.103-2.574 0-1.007-.372-1.862-1.106-2.537-.71-.678-1.616-1.006-2.681-1.006-1.044 0-1.945.331-2.678 1.003l-.006.006c-.708.677-1.063 1.532-1.063 2.534Zm.413-.017v.017c0 .894.312 1.653.935 2.277.65.596 1.45.894 2.399.894.975 0 1.775-.298 2.398-.894.647-.62.972-1.374.976-2.262-.004.887-.33 1.64-.976 2.26-.623.596-1.423.894-2.398.894-.949 0-1.748-.298-2.399-.894-.623-.624-.935-1.383-.935-2.277v-.015Zm-5.17 22.288v4.566h17.82v-4.566h-6.342V26.773c0-1.73-.403-3.08-1.3-3.95-.87-.898-2.221-1.3-3.95-1.3h-5.658v4.566h4.885c.366 0 .566.093.679.21.115.118.209.331.209.718v10.929h-6.342Zm17.406 4.15H20.21V38.36v3.74h16.992v-.002Zm-10.65-3.74V27.016c0-.894-.434-1.341-1.301-1.341h-4.472v-3.739 3.74h4.472c.867 0 1.3.448 1.3 1.342v11.34Z"
        clipRule="evenodd"
      />
    </>
  ),
  success: (
    <>
      <circle cx="27.3062" cy="27.291" r="27" fill="white" />
      <path
        d="M13.4231 27.1696L20.9432 35.919C21.9135 37.0479 23.6611 37.0478 24.6313 35.919L41.2531 16.5791"
        className="stroke-success"
        stroke-width="6.07886"
      />
    </>
  ),
  warning: (
    <>
      <circle cx={27.338} cy={27.322} r={27} fill="#fff" />
      <path
        className="fill-warning"
        fillRule="evenodd"
        d="m24.1 12.153.698 19.437h4.954l.742-19.437H24.1Zm-.904 26.406c0 1.094.412 2.038 1.217 2.812l.006.006c.806.744 1.788 1.115 2.92 1.115 1.155 0 2.142-.37 2.925-1.121.804-.774 1.216-1.718 1.216-2.812 0-1.093-.411-2.027-1.22-2.774-.782-.75-1.767-1.118-2.922-1.118-1.131 0-2.113.371-2.92 1.115-.81.748-1.222 1.682-1.222 2.777Zm.65 1.243c.179.462.466.883.86 1.263.725.668 1.602 1.002 2.632 1.002 1.058 0 1.936-.334 2.632-1.002.724-.696 1.086-1.532 1.086-2.506a3.342 3.342 0 0 0 0-.002c0 .975-.363 1.81-1.087 2.506-.696.669-1.573 1.003-2.631 1.003-1.03 0-1.908-.334-2.632-1.003-.394-.379-.681-.8-.86-1.261Zm1.362-8.638v.001h4.135l.71-18.587-.71 18.586h-4.135Z"
        clipRule="evenodd"
      />
    </>
  ),
  alert: (
    <>
      <circle cx={27} cy={27.742} r={27} fill="#fff" />
      <g clipPath="url(#bell)">
        <path
          className="fill-alert"
          d="M28.975 17.084c3.01.448 5.056 2.516 5.843 5.402.725 2.654-.108 5.458.669 8.023.56 1.848 1.534 1.994 2.804 3.11 1.202 1.06 1.34 2.562-.404 3.002h-7.123c-.235 5.022-7.34 5.025-7.62.004H16.02c-.788-.146-1.295-.863-1.202-1.654.15-1.217 2.206-2.117 2.994-3.099 1.64-2.038.762-5.85 1.146-8.352.516-3.345 2.562-5.817 5.96-6.451.182-2.629 3.923-2.655 4.054.01l.003.005Z"
        />
      </g>
      <defs>
        <clipPath id="bell">
          <path fill="#fff" d="M14.806 15.094h24.387v25.298H14.806z" />
        </clipPath>
      </defs>
    </>
  ),
}

/**
 * TODO: investigate using a radix callout here instead of this one
 */
export const Callout = ({type, title, description}: CalloutProps) => {
  const containerClassName = cssClasses[type]
  const icon = IconMap[type]

  return (
    <div
      className={twMerge(
        `text-md relative my-6  ml-6 max-w-4xl rounded-[20px] py-5  pl-10 pr-4`,
        containerClassName,
      )}
      role="alert"
    >
      <svg
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        height={55}
        width={55}
        viewBox="0 0 55 55"
      >
        {icon}
      </svg>

      <span className="sr-only">Info</span>
      <div className="text-sm">
        <span className="mb-2 block text-lg">{title}</span> {description}
      </div>
    </div>
  )
}
