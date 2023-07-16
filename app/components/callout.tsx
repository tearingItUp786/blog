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

export const Callout = ({type, title, description}: CalloutProps) => {
  const containerClassName = cssClasses[type]
  return (
    <div
      className={twMerge(
        `mb-4 flex items-center rounded-lg border p-4 text-sm `,
        containerClassName,
      )}
      role="alert"
    >
      <span className="sr-only">Info</span>
      <div>
        <span className="font-medium">{title}</span>
        {description}
      </div>
    </div>
  )
}
