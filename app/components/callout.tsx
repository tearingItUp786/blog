import {twMerge} from 'tailwind-merge'

type CalloutProps = {
  type: 'alert' | 'info' | 'success' | 'warning'
  title: string
  description: string
}

const cssClasses = {
  info: 'bg-info-100 text-info-300 border-info-300',
  success: 'bg-success-100 text-success-300 border-success-300',
  warning: 'bg-warning-100 text-warning-300 border-warning-300',
  alert: 'bg-alert-100 text-alert-300 border-alert-300',
}

/**
 * TODO: investigate using a radix callout here instead of this one
 */
export const Callout = ({type, title, description}: CalloutProps) => {
  const containerClassName = cssClasses[type]
  return (
    <div
      className={twMerge(
        `text-md mb-6 flex items-center rounded-lg border p-4`,
        containerClassName,
      )}
      role="alert"
    >
      <svg
        className="mr-3 inline h-4 w-4 flex-shrink-0"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
      </svg>
      <span className="sr-only">Info</span>
      <div>
        <span className="font-bold">{title}</span> {description}
      </div>
    </div>
  )
}
