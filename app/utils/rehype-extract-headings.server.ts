import { type MdxHeading } from '~/schemas/github'

type HastNode = {
	type: string
	tagName?: string
	value?: string
	properties?: Record<string, unknown>
	children?: HastNode[]
}

function getNodeText(node: HastNode): string {
	if (node.type === 'text') return node.value ?? ''
	return node.children?.map(getNodeText).join('') ?? ''
}

export function rehypeExtractHeadings({
	headings,
}: {
	headings: MdxHeading[]
}) {
	return (tree: HastNode) => {
		const visit = (node: HastNode) => {
			if (
				node.type === 'element' &&
				['h2', 'h3'].includes(node.tagName ?? '')
			) {
				const id = node.properties?.id

				if (typeof id === 'string') {
					headings.push({
						id,
						text: getNodeText(node).replace(/\s+/g, ' ').trim(),
						depth: node.tagName === 'h2' ? 2 : 3,
					})
				}
			}

			node.children?.forEach(visit)
		}

		visit(tree)
	}
}
