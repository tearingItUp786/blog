export function normalizeBlogPageParam(
	value: string | null | undefined,
): number {
	const parsed = parseInt(String(value ?? ''), 10)
	return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
}

export function isTilFromFetcher(requestUrl: string): boolean {
	return new URL(requestUrl).searchParams.has('fromFetcher')
}

export function getEffectiveTilOffset(
	endOffset: number,
	maxOffset: number,
): number {
	return Math.min(endOffset, maxOffset)
}

export function isXmlPageParam(pageParam: string): boolean {
	return pageParam.includes('.xml')
}
