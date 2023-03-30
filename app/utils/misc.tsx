import * as dateFns from 'date-fns'

// export function dateFormat(date: string) {
//   return date
//   // return format(parseISO(date), 'MMMM dd, yyyy')
// }
//
// export function dotFormattedDate(date: string) {
//   return date
//   // return format(parseISO(date), 'd.MM.yyyy')
// }

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
