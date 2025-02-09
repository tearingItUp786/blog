import cachified, {verboseReporter} from '@epic-web/cachified'
import {z} from 'zod'
import {redisCache} from './redis.server'

const QuoteSchema = z.object({
  data: z.object({
    author: z.string(),
    quote: z.string(),
  }),
})

export async function getQuoteForClientSide() {
  console.log('getQuoteForClientSide')
  try {
    const res = await fetch('https://stoic.tekloon.net/stoic-quote', {
      method: 'GET',
    })
    const jsonData = await res.json()
    const parsedJsonData = QuoteSchema.parse(jsonData)

    return {
      ...parsedJsonData.data,
    }
  } catch (err) {
    return {
      author: 'Taran Bains',
      quote:
        "Sometimes stuff breaks, and that's okay. Including my quotes API 😅",
    }
  }
}

/**
 * @param count - number
 * This returns a quote from the chosen quote API
 * We cache it for one hour and even if we error out, we'll return a funny quote
 * so there's no need to catch an error
 */
export async function getQuote({count}: {count: number}) {
  return cachified(
    {
      key: `home:query:${count}`,
      cache: redisCache,
      ttl: 60 * 60 * 1000, // one hour of ttl
      getFreshValue: async () => {
        try {
          const res = await fetch('https://stoic.tekloon.net/stoic-quote')
          const jsonData = await res.json()
          const parsedJsonData = QuoteSchema.parse(jsonData)
          return {
            ...parsedJsonData.data,
          }
        } catch (err) {
          return {
            author: 'Taran Bains',
            quote:
              "Sometimes stuff breaks, and that's okay. Including my quotes API 😅",
          }
        }
      },
    },
    verboseReporter(),
  )
}
