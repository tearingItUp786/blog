import tailwindcss from '@tailwindcss/postcss'
import cssnano from 'cssnano'

const plugins = [
	tailwindcss(),
	process.env.NODE_ENV === 'production'
		? cssnano({
				preset: ['default', { cssDeclarationSorter: false }],
			})
		: null,
].filter(Boolean)

export default { plugins }
