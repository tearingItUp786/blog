import * as dateFns from 'date-fns'

export function invariantResponse(
  condition: any,
  message?: string | (() => string),
  responseInit?: ResponseInit,
): asserts condition {
  if (!condition) {
    throw new Response(
      typeof message === 'function'
        ? message()
        : message ||
          'An invariant failed, please provide a message to explain why.',
      {status: 400, ...responseInit},
    )
  }
}

export function dateFormat(dateString: string) {
  return dateFns.format(parseDate(dateString), 'MMMM dd, yyyy')
}

export function dotFormattedDate(dateString: string) {
  return dateFns.format(parseDate(dateString), 'dd.MM.yyyy')
}

function parseDate(dateString: string) {
  return dateFns.add(dateFns.parseISO(dateString), {
    minutes: new Date(dateString).getTimezoneOffset(),
  })
}
