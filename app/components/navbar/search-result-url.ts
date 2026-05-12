export function getSearchResultUrl({
	type,
	objectID,
	offset,
	query,
}: {
	type: string
	objectID: string
	offset?: number
	query: string
}): string {
	const params = new URLSearchParams({ q: query })
	if (type === 'til') {
		const tilOffset = offset ?? 1
		return `/til?offset=${tilOffset}&${params}#${objectID}`
	}
	return `/${type}/${objectID}?${params}`
}
