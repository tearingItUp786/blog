import { type Element, type Root } from 'hast'

import { parseGeneratedSvg } from './generated-svg.server'
import { getMermaidAssetName } from './mermaid-diagrams'

type GeneratedMermaidOptions = {
	files: Record<string, string>
	slug: string
}

type ChildContainer = Root | Element | { children: Root['children'] }

function isMermaidCodeBlock(node: Element) {
	if (node.tagName !== 'pre' || node.children.length !== 1) return false
	const code = node.children[0]
	if (code?.type !== 'element' || code.tagName !== 'code') return false
	const classNames = Array.isArray(code.properties.className)
		? code.properties.className.map(String)
		: []
	return classNames.includes('language-mermaid')
}

function getCodeSource(node: Element) {
	const code = node.children[0]
	if (code?.type !== 'element') return null
	const source = code.children
		.filter((child) => child.type === 'text')
		.map((child) => child.value)
		.join('')
	return source || null
}

export function rehypeGeneratedMermaid(options: GeneratedMermaidOptions) {
	return (tree: Root) => {
		let occurrence = 0

		function transformChildren(parent: ChildContainer) {
			for (let index = 0; index < parent.children.length; index += 1) {
				const child = parent.children[index]

				if (child?.type === 'element' && isMermaidCodeBlock(child)) {
					const source = getCodeSource(child)
					const currentOccurrence = occurrence
					occurrence += 1
					if (!source) continue

					const assetName = getMermaidAssetName(source)
					const svgSource = options.files[assetName]
					if (!svgSource) continue

					const namespace = `${options.slug}-${assetName.replace(/\.svg$/, '')}-${currentOccurrence}`
					const result = parseGeneratedSvg(svgSource, namespace)
					if (result.ok) {
						parent.children[index] = {
							type: 'element',
							tagName: 'div',
							properties: {
								ariaLabel: 'Diagram',
								className: ['generated-mermaid-scroll'],
								role: 'region',
								tabIndex: 0,
							},
							children: [result.svg],
						}
					}
					continue
				}

				if (child && 'children' in child) transformChildren(child)
			}
		}

		transformChildren(tree)
	}
}
