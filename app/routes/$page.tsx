import {
	type LoaderFunctionArgs,
	type MetaFunction,
	type ShouldRevalidateFunctionArgs,
	useLoaderData,
	data,
} from 'react-router'
import { H1, H4 } from '~/components/typography'
import { useMdxComponent } from '~/utils/mdx-utils'
import { getMdxPageGql } from '~/utils/mdx-utils.server'
import { invariantResponse } from '~/utils/misc'

export function shouldRevalidate({
	currentUrl,
	nextUrl,
	defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
	if (currentUrl.pathname === nextUrl.pathname) {
		return false
	}

	return defaultShouldRevalidate
}

export const meta: MetaFunction<typeof loader> = () => {
	return [
		{
			title: `Taran "tearing it up" Bains | What I use`,
		},
		{
			name: 'description',
			content: `A list of tools and services I use in my day-to-day life`,
		},
	]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariantResponse(params?.page, 'No slug provided')

	try {
		const page = await getMdxPageGql({
			contentDir: 'pages',
			slug: params.page,
		})
		return { page }
	} catch (err) {
		throw data({ error: params.slug }, { status: 404 })
	}
}

export default function Page() {
	const data = useLoaderData<typeof loader>()
	const { code, frontmatter } = data.page
	const Component = useMdxComponent(String(code))

	return (
		<div className="mx-auto mt-6 mb-4 min-h-[100vh] max-w-(--breakpoint-xl) px-4 pb-24 md:mt-14 md:mb-10 md:px-20">
			<div className="">
				<main className="prose prose-light dark:prose-dark relative mb-10 max-w-7xl grid-cols-4 break-words">
					<H1>{frontmatter.title}</H1>
					{frontmatter.subtitle ? (
						<H4 As="h2" variant="secondary" className="mb-4 leading-tight">
							{frontmatter.subtitle}
						</H4>
					) : null}
					<Component />
				</main>
			</div>
		</div>
	)
}
