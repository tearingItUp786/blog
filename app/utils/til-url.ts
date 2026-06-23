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

export function shouldUseTilScrollFallback({
	locationKey,
	hash,
	targetId,
}: {
	locationKey: string
	hash: string
	targetId: string | null
}) {
	return locationKey === 'default' && !hash && Boolean(targetId)
}
