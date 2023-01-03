export function dateFormat(date: string) {
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'long' }).format(
    new Date(date)
  )
}

export function dotFormattedDate(date: string) {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'short',
  })
    .formatToParts(new Date(date))
    .reduce((acc, part) => {
      return acc + (part.type !== 'literal' ? part.value : '.')
    }, '')
}
