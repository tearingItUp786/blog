import { z } from 'zod'

export const GitHubFileSchema = z.object({
	path: z.string(),
	content: z.string(),
})

export type GitHubFile = z.infer<typeof GitHubFileSchema>

export const GithubGraphqlObjectSchema = z.object({
	name: z.string(),
	type: z.string().optional(),
	object: z.object({
		text: z.string().nullish(),
		get entries() {
			return z.array(GithubGraphqlObjectSchema).optional()
		},
	}),
})

export type GithubGraphqlObject = z.infer<typeof GithubGraphqlObjectSchema>

export const GithubDownloadDirResponseSchema = z.object({
	repository: z.object({
		object: z
			.object({
				entries: z.array(GithubGraphqlObjectSchema).nullish(),
			})
			.nullable(),
	}),
})

export type GithubDownloadDirResponse = z.infer<
	typeof GithubDownloadDirResponseSchema
>

const nullToUndefined = (value: unknown) => (value === null ? undefined : value)

const optionalFromNull = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
	z.preprocess(nullToUndefined, schema.optional())

const OptionalStringSchema = optionalFromNull(z.string())
const OptionalBooleanSchema = optionalFromNull(z.boolean())
const OptionalCalloutTypeSchema = optionalFromNull(
	z.enum(['success', 'warning', 'alert', 'info']),
)

const DateAsStringSchema = z.preprocess((value) => {
	if (value === null || value === undefined) return undefined
	if (value instanceof Date) return value.toISOString().slice(0, 10)
	return value
}, z.iso.date().optional())

const MdxMatterDataSchema = z.object({
	title: OptionalStringSchema,
	date: DateAsStringSchema,
	tag: OptionalStringSchema,
})

const MdxMatterSchema = optionalFromNull(
	z.object({
		content: OptionalStringSchema,
		data: optionalFromNull(MdxMatterDataSchema),
	}),
)

const MdxFrontmatterSchema = z.object({
	title: OptionalStringSchema,
	subtitle: OptionalStringSchema,
	description: OptionalStringSchema,
	date: DateAsStringSchema,
	tag: OptionalStringSchema,
	draft: OptionalBooleanSchema,
	hero: OptionalStringSchema,
	callOutType: OptionalCalloutTypeSchema,
})

export const ReadTimeSchema = z.object({
	minutes: z.number(),
	text: z.string(),
	time: z.number(),
	words: z.number(),
})

export const MdxPageSchema = z.object({
	code: z.string().optional(),
	readTime: ReadTimeSchema.optional(),
	frontmatter: MdxFrontmatterSchema,
	matter: MdxMatterSchema,
	slug: OptionalStringSchema,
})

export type MdxPage = z.infer<typeof MdxPageSchema>

export const MdxPageAndSlugSchema = MdxPageSchema.extend({
	path: z.string().optional(),
})

export type MdxPageAndSlug = z.infer<typeof MdxPageAndSlugSchema>

export const TilMdxPageSchema = MdxPageAndSlugSchema.extend({
	offset: z.number(),
})

export type TilMdxPage = z.infer<typeof TilMdxPageSchema>
