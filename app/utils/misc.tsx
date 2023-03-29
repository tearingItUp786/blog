import {format, parseISO} from 'date-fns'

export function dateFormat(date: string) {
  return format(parseISO(date), 'MMMM dd, yyyy')
}

export function dotFormattedDate(date: string) {
  return format(parseISO(date), 'd.MM.yyyy')
}
