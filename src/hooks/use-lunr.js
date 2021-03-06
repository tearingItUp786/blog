import React from "react"

function getSearchResults(query, lng) {
  if (!query || !window.__LUNR__) return []
  const lunrIndex = window.__LUNR__[lng]
  const results = lunrIndex.index.search(`${query}~1`) // you can  customize your search , see https://lunrjs.com/guides/searching.html
  return results.map(({ ref }) => lunrIndex.store[ref])
}

function useLunr({ query, lng }) {
  const [results, resultsSet] = React.useState([])
  const [error, setError] = React.useState(null)
  React.useEffect(() => {
    try {
      const results = getSearchResults(query, lng)
      resultsSet(results)
      setError(null)
    } catch (e) {
      setError(e)
      resultsSet([])
    }
  }, [query, lng])

  return {
    results,
    error,
  }
}

export default useLunr
