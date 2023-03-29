import {format, parseISO} from 'date-fns'

export function dateFormat(date: string) {
  const [year, month, day] = date.split(/[-T]/)
  return format(new Date(`${year}-${month}-${day}`), 'MMMM dd, yyyy')
}

export function dotFormattedDate(date: string) {
  const [year, month, day] = date.split(/[-T]/)
  return format(new Date(`${year}-${month}-${day}`), 'd.MM.yyyy')
  // return format(parseISO(date), 'd.MM.yyyy')
}
