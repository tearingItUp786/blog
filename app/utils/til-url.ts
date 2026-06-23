export function getTilRssItemUrl({
	baseUrl,
	offset,
	slug,
}: {
	baseUrl: string
	offset: number
	slug: string
}) {
	// Homarr strips URL fragments from RSS item links, so keep the hash for
	// normal clients and duplicate the target slug in `til` as a fallback.
	const params = new URLSearchParams({
		offset: String(offset),
		til: slug,
	})

	return `${baseUrl}?${params}#${slug}`
}

let initialDocumentUrl: string | null = null

export function getTilDocumentUrl({
	pathname,
	search,
}: {
	pathname: string
	search: string
}) {
	return `${pathname}${search}`
}

export function setInitialDocumentUrl(url: string) {
	initialDocumentUrl = url
}

export function getInitialDocumentUrl() {
	return initialDocumentUrl
}

export function shouldUseTilScrollFallback({
	initialDocumentUrl,
	currentDocumentUrl,
	hash,
	targetId,
}: {
	initialDocumentUrl: string | null
	currentDocumentUrl: string
	hash: string
	targetId: string | null
}) {
	return Boolean(targetId) && !hash && initialDocumentUrl === currentDocumentUrl
}
