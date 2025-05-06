// straight up copied from an LLM
export function replaceContent(str = '') {
	if (!str) return ''

	// Handle all variations of code block formatting and fragments
	let result = str
		// First handle complete code blocks
		.replace(/```[\s\S]*?```/g, '')

		// Handle any remaining backtick fragments with language tags
		.replace(/```\s*[a-zA-Z0-9]+[\s\S]*?(?:```|$)/g, '')

		// Handle standalone code markers that might be left
		.replace(/```[^\n`]*(?:\n|$)/g, '')

		// Strip MDX-specific content
		.replace(/import\s+.*?\s+from\s+['"].*?['"]/g, '') // Remove import statements
		.replace(/import\s+{\s*.*?\s*}\s+from\s+['"].*?['"]/g, '') // Remove named imports
		.replace(/export\s+default\s+.*?(?:\r\n|\r|\n|$)/g, '') // Remove export default statements
		.replace(/export\s+const\s+.*?(?:;|$)/g, '') // Remove export const statements
		.replace(/<.*?gss.*?>.*?<\/.*?>/g, '') // Remove GSS component tags
		.replace(/<.*?GSS.*?>.*?<\/.*?>/g, '') // Remove GSS component tags (capitalized)
		.replace(/<.*?Component.*?>.*?<\/.*?>/g, '') // Remove generic component tags
		.replace(/{`.*?`}/g, '') // Remove template literals in braces
		.replace(/{\/\*.*?\*\/}/gs, '') // Remove JSX comments
		.replace(/{\/\/.*?(?:\r\n|\r|\n|$)}/g, '') // Remove single-line comments in braces
		.replace(/{.*?}/g, '') // Remove remaining JSX expressions

		// Original markdown stripping logic
		.replace(/(<([^>]+)>)/gi, '') // Remove HTML tags
		.replace(/!\[.*?\]\(.*?\)/g, '') // Remove image markdown
		.replace(/\[(.*?)\]\(.*?\)/g, '$1') // Replace links with just the text
		.replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2') // Remove bold formatting
		.replace(/(\*|_)(.*?)(\*|_)/g, '$2') // Remove italic formatting
		.replace(/(~~)(.*?)(~~)/g, '$2') // Remove strikethrough
		.replace(/(?:\r\n|\r|\n|^)>.*(?:\r\n|\r|\n|$)/g, '') // Remove blockquotes
		.replace(/(#{1,6}\s)(.*?)(\r\n|\r|\n)/g, '$2') // Remove headers
		.replace(/(\r\n|\r|\n)\s*(\*|-|\+|[0-9]+\.)\s/g, '') // Remove list markers
		.replace(/(\*\*|__|\*|_|~~)/g, '') // Remove any remaining markdown syntax
		.replace(/`.*?`/g, '') // Remove inline code

		// One final pass to catch any remaining backtick fragments
		.replace(/`[^\n`]*(?:\n|$)/g, '')
		.replace(/```/g, '')

		.trim() // Trim whitespace from the result

	return result
}
