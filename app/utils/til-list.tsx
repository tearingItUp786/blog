import { getMdxComponent } from './mdx-utils'
import { type MdxPageAndSlug } from '~/schemas/github'

export function tilMapper(til: MdxPageAndSlug) {
	const component = getMdxComponent(String(til.code))

	// returns the component
	// and the rest of the props
	return {
		...til,
		component,
	}
}
