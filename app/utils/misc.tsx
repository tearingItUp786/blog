import {format, parseISO} from 'date-fns'

export function dateFormat(date: string) {
  return new Date(date).toLocaleDateString('en-CA')
  // return format(parseISO(date), 'MMMM dd, yyyy')
}

export function dotFormattedDate(date: string) {
  return new Date(date).toLocaleDateString('en-CA')
  // return format(parseISO(date), 'd.MM.yyyy')
}
