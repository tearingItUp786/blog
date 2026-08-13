import {
	type Element,
	type ElementContent,
	type Properties,
	type Root,
	type RootContent,
} from 'hast'
import { fromHtml } from 'hast-util-from-html'

const ALLOWED_ELEMENTS = new Set([
	'circle',
	'clipPath',
	'defs',
	'desc',
	'ellipse',
	'g',
	'line',
	'linearGradient',
	'marker',
	'mask',
	'path',
	'pattern',
	'polygon',
	'polyline',
	'radialGradient',
	'rect',
	'stop',
	'svg',
	'symbol',
	'text',
	'title',
	'tspan',
	'use',
])

const ALLOWED_PROPERTIES = new Set([
	'alignmentBaseline',
	'ariaDescribedBy',
	'ariaLabel',
	'ariaLabelledBy',
	'className',
	'clipPath',
	'clipPathUnits',
	'cx',
	'cy',
	'd',
	'dominantBaseline',
	'dx',
	'dy',
	'fill',
	'fillOpacity',
	'fillRule',
	'filter',
	'fontFamily',
	'fontSize',
	'fontStyle',
	'fontWeight',
	'gradientTransform',
	'gradientUnits',
	'height',
	'href',
	'id',
	'letterSpacing',
	'markerEnd',
	'markerHeight',
	'markerMid',
	'markerStart',
	'markerUnits',
	'markerWidth',
	'mask',
	'maskContentUnits',
	'maskUnits',
	'offset',
	'opacity',
	'orient',
	'overflow',
	'paintOrder',
	'pathLength',
	'patternContentUnits',
	'patternTransform',
	'patternUnits',
	'points',
	'preserveAspectRatio',
	'r',
	'refX',
	'refY',
	'role',
	'rx',
	'ry',
	'shapeRendering',
	'spreadMethod',
	'stopColor',
	'stopOpacity',
	'stroke',
	'strokeDashArray',
	'strokeDashoffset',
	'strokeLinecap',
	'strokeLinejoin',
	'strokeMiterlimit',
	'strokeOpacity',
	'strokeWidth',
	'textAnchor',
	'textDecoration',
	'textLength',
	'transform',
	'vectorEffect',
	'viewBox',
	'width',
	'x',
	'x1',
	'x2',
	'xLinkHref',
	'xmlns',
	'y',
	'y1',
	'y2',
])

const ID_REFERENCE_PROPERTIES = new Set([
	'ariaDescribedBy',
	'ariaLabelledBy',
	'href',
	'xLinkHref',
])
const URL_REFERENCE_PROPERTIES = new Set([
	'clipPath',
	'fill',
	'filter',
	'markerEnd',
	'markerMid',
	'markerStart',
	'mask',
	'stroke',
])
const URL_REFERENCE_PATTERN = /^url\(#([^)]+)\)$/

type ParseGeneratedSvgResult =
	| { ok: true; svg: Element }
	| { ok: false; error: string }

function fail(error: string): ParseGeneratedSvgResult {
	return { ok: false, error }
}

function getStringValues(value: Properties[string]) {
	if (Array.isArray(value)) return value.map(String)
	if (value === null || value === undefined) return []
	return String(value).split(/\s+/).filter(Boolean)
}

function getChildElement(element: Element, tagName: string) {
	return element.children.find(
		(child): child is Element =>
			child.type === 'element' && child.tagName === tagName,
	)
}

function getText(element: Element) {
	return element.children
		.filter((child) => child.type === 'text')
		.map((child) => child.value)
		.join('')
		.trim()
}

export function parseGeneratedSvg(
	source: string,
	namespace: string,
): ParseGeneratedSvgResult {
	if (source.length > 1_000_000) return fail('Generated SVG exceeds 1 MB')

	const markup = source.trim().replace(/^<\?xml[^>]*\?>\s*/i, '')
	if (
		(markup.match(/<svg\b/gi)?.length ?? 0) !== 1 ||
		(markup.match(/<\/svg\s*>/gi)?.length ?? 0) !== 1 ||
		!/^<svg\b/i.test(markup) ||
		!/<\/svg\s*>$/i.test(markup) ||
		/<!doctype|<!entity/i.test(markup)
	) {
		return fail('Generated SVG must contain one complete SVG root')
	}

	let tree: Root
	try {
		tree = fromHtml(markup, {
			fragment: true,
			onerror(error) {
				throw error
			},
		}) as unknown as Root
	} catch (error) {
		return fail(
			`Malformed generated SVG: ${error instanceof Error ? error.message : String(error)}`,
		)
	}

	const roots = tree.children.filter(
		(node): node is Element => node.type === 'element',
	)
	if (roots.length !== 1 || roots[0]?.tagName !== 'svg') {
		return fail('Generated SVG must contain one SVG root')
	}

	const root = roots[0]
	if (!root.properties.viewBox) return fail('Generated SVG requires a viewBox')
	if (root.properties.role !== 'img') {
		return fail('Generated SVG requires role="img"')
	}

	const title = getChildElement(root, 'title')
	const description = getChildElement(root, 'desc')
	if (!title) return fail('Generated SVG requires a title')
	if (!description) return fail('Generated SVG requires a description')
	if (!getText(title)) return fail('Generated SVG title must not be empty')
	if (!getText(description)) {
		return fail('Generated SVG description must not be empty')
	}
	const accessibleIds = getStringValues(root.properties.ariaLabelledBy)
	const titleId = String(title.properties.id ?? '')
	const descriptionId = String(description.properties.id ?? '')
	if (
		!titleId ||
		!descriptionId ||
		!accessibleIds.includes(titleId) ||
		!accessibleIds.includes(descriptionId)
	) {
		return fail('Generated SVG must reference its title and description')
	}

	const firstElement = root.children.find((child) => child.type === 'element')
	if (firstElement !== title) return fail('Generated SVG title must be first')

	const ids = new Set<string>()
	const references = new Set<string>()
	let nodeCount = 0
	let validationError: string | undefined

	function validateNode(node: RootContent, depth: number) {
		if (validationError) return
		if (depth > 40) {
			validationError = 'Generated SVG exceeds maximum nesting depth'
			return
		}
		nodeCount += 1
		if (nodeCount > 5_000) {
			validationError = 'Generated SVG exceeds maximum node count'
			return
		}
		if (node.type === 'comment') return
		if (node.type === 'text') return
		if (node.type !== 'element' || !ALLOWED_ELEMENTS.has(node.tagName)) {
			validationError = `SVG element is not allowed: ${
				node.type === 'element' ? node.tagName : node.type
			}`
			return
		}

		for (const [property, value] of Object.entries(node.properties)) {
			if (
				property === 'style' ||
				/^on/i.test(property) ||
				!ALLOWED_PROPERTIES.has(property)
			) {
				validationError = `SVG property is not allowed: ${property}`
				return
			}

			if (property === 'id') {
				const id = String(value)
				if (ids.has(id)) {
					validationError = `Duplicate SVG ID: ${id}`
					return
				}
				ids.add(id)
			}

			if (ID_REFERENCE_PROPERTIES.has(property)) {
				for (const reference of getStringValues(value)) {
					if (property === 'href' || property === 'xLinkHref') {
						if (!reference.startsWith('#')) {
							validationError = `External SVG reference is not allowed: ${reference}`
							return
						}
						references.add(reference.slice(1))
					} else {
						references.add(reference)
					}
				}
			}

			if (URL_REFERENCE_PROPERTIES.has(property)) {
				const stringValue = String(value)
				const isSafeColorFunction =
					/^(?:rgb|rgba|hsl|hsla)\([0-9.,% /+-]+\)$/i.test(stringValue)
				if (
					stringValue.includes('\\') ||
					(/[a-z-]+\(/i.test(stringValue) &&
						!/^url\(/i.test(stringValue) &&
						!isSafeColorFunction)
				) {
					validationError = `SVG paint function is not allowed: ${stringValue}`
					return
				}
				if (/url\(/i.test(stringValue)) {
					const match = stringValue.match(URL_REFERENCE_PATTERN)
					if (!match?.[1]) {
						validationError = `External SVG URL is not allowed: ${stringValue}`
						return
					}
					references.add(match[1])
				}
			}
		}

		for (const child of node.children) validateNode(child, depth + 1)
	}

	validateNode(root, 0)
	if (validationError) return fail(validationError)

	for (const reference of references) {
		if (!ids.has(reference)) {
			return fail(`SVG reference does not resolve: ${reference}`)
		}
	}

	const safeNamespace = namespace.replace(/[^a-zA-Z0-9_-]/g, '-')
	const idMap = new Map(
		[...ids].map((id) => [id, `mermaid-${safeNamespace}-${id}`]),
	)

	function cloneNode(node: ElementContent): ElementContent {
		if (node.type !== 'element') return { type: node.type, value: node.value }

		const properties: Properties = {}
		for (const [property, value] of Object.entries(node.properties)) {
			if (property === 'id') {
				properties.id = idMap.get(String(value))
			} else if (
				property === 'ariaLabelledBy' ||
				property === 'ariaDescribedBy'
			) {
				properties[property] = getStringValues(value).map(
					(id) => idMap.get(id) ?? id,
				)
			} else if (property === 'href' || property === 'xLinkHref') {
				const id = String(value).slice(1)
				properties[property] = `#${idMap.get(id) ?? id}`
			} else if (URL_REFERENCE_PROPERTIES.has(property)) {
				const stringValue = String(value)
				const match = stringValue.match(URL_REFERENCE_PATTERN)
				properties[property] = match?.[1]
					? `url(#${idMap.get(match[1]) ?? match[1]})`
					: value
			} else {
				properties[property] = value
			}
		}

		return {
			type: 'element',
			tagName: node.tagName,
			properties,
			children: node.children.map(cloneNode),
		}
	}

	const svg = cloneNode(root)
	if (svg.type !== 'element') return fail('Generated SVG root is invalid')
	svg.properties.className = ['generated-mermaid']

	return { ok: true, svg }
}
