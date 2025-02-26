import { type MdxPageAndSlug } from 'types'
import { getMdxComponent } from './mdx-utils'

export function tilMapper(til: MdxPageAndSlug) {
	const component = getMdxComponent(String(til.code))

	// returns the component
	// and the rest of the props
	return {
		...til,
		component,
	}
}
