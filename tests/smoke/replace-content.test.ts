import { describe, expect, it } from 'vitest'
import { replaceContent } from '~/inngest/utils'

describe('replaceContent', () => {
	it('returns empty string for empty input', () => {
		expect(replaceContent('')).toBe('')
		expect(replaceContent()).toBe('')
	})

	it('passes plain prose through unchanged', () => {
		expect(replaceContent('TIL about npmx; a fast, modern browser!')).toBe(
			'TIL about npmx; a fast, modern browser!',
		)
	})

	// --- inline code (THE BUG) ---

	it('preserves inline backtick text and strips the markers', () => {
		expect(
			replaceContent('TIL about `@starting-style`; it lets you define'),
		).toBe('TIL about @starting-style; it lets you define')
	})

	it('preserves multiple inline code terms in a sentence', () => {
		expect(replaceContent('Use `defer` and `async` on script tags')).toBe(
			'Use defer and async on script tags',
		)
	})

	// --- fenced code blocks ---

	it('strips a plain fenced code block entirely', () => {
		const input = `Some prose.\n\n\`\`\`js\nconsole.log('hi')\n\`\`\`\n\nMore prose.`
		expect(replaceContent(input)).toBe('Some prose.\n\nMore prose.')
	})

	it('strips fenced code blocks with :title= meta', () => {
		const input = `Before.\n\n\`\`\`jsx:title=example.js\nconst x = 1\n\`\`\`\n\nAfter.`
		expect(replaceContent(input)).toBe('Before.\n\nAfter.')
	})

	it('strips fenced code blocks with {line-range} meta', () => {
		const input = `Before.\n\n\`\`\`css {5-8}\n.card { opacity: 0; }\n\`\`\`\n\nAfter.`
		expect(replaceContent(input)).toBe('Before.\n\nAfter.')
	})

	it('strips the starting-style TIL correctly (primary bug)', () => {
		const input = `TIL about \`@starting-style\`; it lets you define the initial styles of an element before its first style is applied
— essentially giving you a "from" state for CSS transitions on elements that are
being added to the DOM or transitioning from display: none.

\`\`\`css {5-8}
.card {
\ttransition:
\t\topacity 0.3s,
\t\ttransform 0.3s;
\t@starting-style {
\t\topacity: 0;
\t\ttransform: translateY(10px);
\t}
}
\`\`\``

		const result = replaceContent(input)
		expect(result).toContain('@starting-style')
		expect(result).toContain('it lets you define the initial styles')
		expect(result).not.toContain('opacity: 0')
		expect(result).not.toContain('translateY')
	})

	// --- MDX imports / exports ---

	it('strips import statements', () => {
		const input = `import Popover from './popover'\n\nSome prose.`
		expect(replaceContent(input)).toBe('Some prose.')
	})

	it('strips named import statements', () => {
		const input = `import { ValidationDemo } from './validation-demo'\n\nSome prose.`
		expect(replaceContent(input)).toBe('Some prose.')
	})

	it('strips export default statements', () => {
		const input = `export default function Component() {}\n\nSome prose.`
		expect(replaceContent(input)).toBe('Some prose.')
	})

	// --- JSX components ---

	it('strips self-closing PascalCase JSX components', () => {
		const input = `Before.\n\n<InlineImage src="https://example.com/img.jpg" alt="hero" />\n\nAfter.`
		expect(replaceContent(input)).toBe('Before.\n\nAfter.')
	})

	it('strips paired PascalCase component tags and their content', () => {
		const input = `Before.\n\n<BlockQuote author="Someone">A famous quote.</BlockQuote>\n\nAfter.`
		expect(replaceContent(input)).toBe('Before.\n\nAfter.')
	})

	it('strips Callout components', () => {
		const input = `Before.\n\n<Callout type="info" description="Note this." />\n\nAfter.`
		expect(replaceContent(input)).toBe('Before.\n\nAfter.')
	})

	// --- JSX expressions ---

	it('strips {" "} whitespace JSX expressions', () => {
		expect(replaceContent("need to rewatch his talk.{' '}Check it out")).toBe(
			'need to rewatch his talk.Check it out',
		)
	})

	it('strips JSX block comments', () => {
		const input = `Before. {/* this is a comment */} After.`
		expect(replaceContent(input)).toBe('Before.  After.')
	})

	it('strips template literal JSX expressions', () => {
		const input = 'description={`script type "module" is always deferred`}'
		expect(replaceContent(input)).toBe('')
	})

	// --- markdown formatting ---

	it('unwraps links to just their text', () => {
		expect(replaceContent('[Check it out](https://npmx.dev)')).toBe(
			'Check it out',
		)
	})

	it('strips image markdown', () => {
		expect(
			replaceContent('![alt text](https://example.com/img.png) prose'),
		).toBe('prose')
	})

	it('strips bold formatting', () => {
		expect(replaceContent('This is **bold** text')).toBe('This is bold text')
	})

	it('strips italic formatting', () => {
		expect(replaceContent('This is *italic* text')).toBe('This is italic text')
	})

	it('strips strikethrough', () => {
		expect(replaceContent('This is ~~struck~~ text')).toBe(
			'This is struck text',
		)
	})

	it('strips heading markers', () => {
		expect(replaceContent('## My Heading\n\nProse.')).toBe(
			'My Heading\n\nProse.',
		)
	})

	it('strips unordered list markers', () => {
		expect(replaceContent('- item one\n- item two')).toBe('item one\nitem two')
	})

	it('strips blockquote markers', () => {
		expect(replaceContent('> A blockquote line')).toBe('A blockquote line')
	})

	// --- HTML tags ---

	it('strips remaining HTML tags, keeping inner text', () => {
		expect(replaceContent('<p>Some paragraph text</p>')).toBe(
			'Some paragraph text',
		)
	})

	it('strips div tag markers but keeps inner content (e.g. prose, tables)', () => {
		expect(replaceContent('<div className="foo">Some text</div>')).toBe(
			'Some text',
		)
	})

	it('strips div wrappers but not prose children', () => {
		expect(replaceContent('<div className="foo">Some text</div>')).toBe(
			'Some text',
		)
	})
})
