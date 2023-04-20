/**
 * In order to give a nice design experience with random
 * lines jutting out of the blog list cards
 * we need to generate server side and statically the
 * tailwind classes that will be used to style the lines
 */
export const getRandomLineClasses = (orientation: 'left' | 'right') => {
  let rightValues = [
    'md:pl-8 after:w-5',
    'md:pl-10 after:w-7',
    'md:pl-12 after:w-8',
    'md:pl-14 after:w-10',
  ]

  let leftValues = [
    'md:pr-8 after:w-5',
    'md:pr-10 after:w-7',
    'md:pr-12 after:w-8',
    'md:pr-14 after:w-10',
  ]

  let values = orientation === 'right' ? rightValues : leftValues

  return values[Math.floor(Math.random() * values.length)] as string
}

// the classes applied to the div column container
export const getContainerClassName = (isRight = false) =>
  isRight
    ? 'col-span-full text-center md:text-left md:col-span-2 md:col-start-2'
    : 'col-span-full text-center md:text-right'

export const getBlogCardClassName = (isRight = false) =>
  isRight ? `max-w-full after:left-0` : 'max-w-full md:max-w-[50%] md:pr-10'
