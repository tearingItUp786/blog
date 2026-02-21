const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear()

	if (month.length < 2) month = '0' + month
	if (day.length < 2) day = '0' + day

	return [year, month, day].join('-')
}

// Helper function to safely extract tags
function extractTags(files) {
	const tagMap = new Map()

	for (const file of files) {
		const tag = file.frontmatter?.tag?.toLowerCase()
		if (tag && !tagMap.has(tag)) {
			tagMap.set(tag, 1)
		} else if (tag) {
			tagMap.set(tag, (tagMap.get(tag) || 1) + 1)
		}
	}

	return tagMap
}

// Function to recursively read .mdx files and extract frontmatter
function getMdxFilesWithFrontmatter(directory) {
	const results = []

	function traverseDirectory(currentPath) {
		try {
			const items = fs.readdirSync(currentPath)

			for (const item of items) {
				const fullPath = path.join(currentPath, item)

				try {
					const stat = fs.statSync(fullPath)

					if (stat.isDirectory()) {
						traverseDirectory(fullPath)
					} else if (path.extname(item) === '.mdx') {
						const fileContent = fs.readFileSync(fullPath, 'utf8')
						const { data: frontmatter, content } = matter(fileContent)

						results.push({
							filePath: fullPath,
							relativePath: path.relative(directory, fullPath),
							frontmatter: frontmatter || {},
							content,
						})
					}
				} catch (fileError) {
					console.warn(
						`Warning: Could not process ${fullPath}:`,
						fileError.message,
					)
				}
			}
		} catch (dirError) {
			console.warn(
				`Warning: Could not read directory ${currentPath}:`,
				dirError.message,
			)
		}
	}

	if (fs.existsSync(directory)) {
		traverseDirectory(directory)
	} else {
		console.warn(`Warning: Directory ${directory} does not exist`)
	}

	return results
}

// Extract and combine tags
const tagFiles = extractTags(
	getMdxFilesWithFrontmatter(path.join(__dirname, 'content')),
)
const tags = new Set([...tagFiles])
const tagsChoices = [...tags].sort()

const maxWidth = Math.max(
	...tagsChoices.map(([, value]) => String(value).length),
)
const customTagValue = '__custom_tag__'
const terminalRows = process.stdout.rows || 24
const minimumTagPageSize = 5
const promptPadding = 8
const tagPageSize = Math.min(
	tagsChoices.length + 1,
	Math.max(minimumTagPageSize, terminalRows - promptPadding),
)

const now = formatDate(Date.now())
module.exports = (plop) => {
	plop.setGenerator('til', {
		description: 'Create a brand new TIL',
		prompts: [
			{
				type: 'input',
				name: 'title',
				message: 'What is your TIL title',
			},
			{
				default: now,
				type: 'input',
				name: 'date',
				message: 'What is the date of this TIL',
			},
			{
				type: 'list',
				name: 'tag',
				choices: [
					...tagsChoices.map(([tag, count]) => ({
						name: `${String(count).padEnd(maxWidth)} | ${tag}`,
						value: tag,
					})),
					{
						name: 'Other (type a custom tag)',
						value: customTagValue,
					},
				],
				message: 'What tag is this TIL associated with?',
				pageSize: tagPageSize,
				loop: true,
			},
			{
				when: function (answers) {
					return answers.tag === customTagValue
				},
				type: 'input',
				askAnswered: true,
				name: 'tag',
				message: 'What is your custom tag',
			},
			{
				type: 'editor',
				name: 'content',
				message:
					'Write your TIL markdown body. Save and close the editor when done.',
				default: '## Today I learned\n\n',
			},
		],
		actions: [
			{
				// Add a new file
				type: 'add',
				// Path for the new file
				path: `content/til/${now}-{{ dashCase title }}/${now}-{{ dashCase title }}.mdx`,
				// Handlebars template used to generate content of new file
				templateFile: 'plop-templates/til.mdx.hbs',
			},
		],
	})
}
