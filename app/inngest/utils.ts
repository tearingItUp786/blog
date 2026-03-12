export function replaceContent(str = '') {
	if (!str) return ''

	return (
		str
			// Pass 1: Fenced code blocks
			// Strip all fenced code blocks (handles plain, :title=, {line}, title="...")
			.replace(/```[\s\S]*?```/g, '')
			// Strip any unclosed fenced block that runs to end of string
			.replace(/```[\s\S]*$/g, '')

			// Pass 2: MDX imports / exports
			// Must be line-start anchored so we don't accidentally catch inline "import" words
			.replace(/^import\s[\s\S]*?from\s['"].*?['"]\s*$/gm, '')
			.replace(
				/^export\s+(default|const|function)\s[\s\S]*?(?=\n\n|\n*$)/gm,
				'',
			)

			// Pass 3: JSX components
			// Self-closing PascalCase components: <InlineImage ... />
			.replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '')
			// Paired PascalCase components and all their children: <BlockQuote>...</BlockQuote>
			.replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '')
			// Strip iframe/video entirely — no useful prose inside
			.replace(/<(iframe|video)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
			.replace(/<(iframe|video|br)\b[^>]*\/>/gi, '')
			// For div/p: strip the tag markers but keep inner content
			// (may wrap markdown tables, prose, or mermaid blocks already gone from pass 1)
			.replace(/<\/?(div|p)\b[^>]*>/gi, '')

			// Pass 4: JSX expressions
			// Template literal props: description={`...`}
			.replace(/\w+=\{`[^`]*`\}/g, '')
			// Whitespace / string expressions: {' '}, {"text"}
			.replace(/\{['"][^'"]*['"]\}/g, '')
			// Block JSX comments: {/* ... */}
			.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
			// Single-line JSX comments: {// ...}
			.replace(/\{\/\/[^\n]*\}/g, '')
			// Remaining JSX expressions (but not escaped \{...\} which are prose)
			.replace(/(?<!\\)\{[^}]*\}/g, '')

			// Pass 5: Markdown to plain text
			// Images (strip entirely — no useful text for search)
			.replace(/!\[.*?\]\(.*?\)/g, '')
			// Links: keep the visible text
			.replace(/\[(.*?)\]\(.*?\)/g, '$1')
			// Bold
			.replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2')
			// Italic
			.replace(/(\*|_)(.*?)(\*|_)/g, '$2')
			// Strikethrough
			.replace(/(~~)(.*?)(~~)/g, '$2')
			// Heading markers (## My Heading -> My Heading)
			.replace(/^#{1,6}\s+/gm, '')
			// Unordered list markers
			.replace(/^\s*[-*+]\s+/gm, '')
			// Ordered list markers
			.replace(/^\s*\d+\.\s+/gm, '')
			// Blockquote markers
			.replace(/^>\s*/gm, '')
			// Any remaining HTML tags (strip tag, keep inner text)
			.replace(/(<([^>]+)>)/gi, '')

			// Pass 6: Inline code
			// Strip backtick markers, keep the text: `@starting-style` -> @starting-style
			.replace(/`([^`\n]+)`/g, '$1')

			// Pass 7: Cleanup
			// Collapse 3+ blank lines to 2
			.replace(/\n{3,}/g, '\n\n')
			// Strip lines that are now only whitespace
			.replace(/^[^\S\n]+$/gm, '')
			.trim()
	)
}
