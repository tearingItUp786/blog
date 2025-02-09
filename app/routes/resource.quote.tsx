import {getQuoteForClientSide} from '~/utils/quote.server'

export async function loader() {
  // Fetch initial data to determine maxOffset
  const clientQuoteData = await getQuoteForClientSide()
  return {
    quoteData: clientQuoteData,
    count: 1,
  }
}
