export default {
	'*.+(js|jsx|json|yml|yaml|css|less|scss|ts|tsx|mdx|md|graphql|mdx|vue)': [
		() => `npm run clean --silent`,
		`pnpm run test --silent -- --watch=false`,
		`pnpm run lint`,
		() => `pnpm run typecheck`,
		`prettier --write`,
	],
}
