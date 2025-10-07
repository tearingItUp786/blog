import {
	type LoaderFunctionArgs,
	type MetaFunction,
	type ShouldRevalidateFunctionArgs,
	useLoaderData,
	data,
	redirect,
} from 'react-router'
import { Callout } from '~/components/callout'
import { H1, H4 } from '~/components/typography'
import { useMdxComponent } from '~/utils/mdx-utils'
import { getMdxPageGql } from '~/utils/mdx-utils.server'
import { dateFormat, invariantResponse } from '~/utils/misc'

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

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const { page } = data ?? {}
	const { frontmatter } = page ?? {}
	return [
		{
			title: `Taran "tearing it up" Bains | ${frontmatter?.title ?? 'Page'}`,
		},
		{
			name: 'description',
			content: `${frontmatter?.description ?? ''}`,
		},
	]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariantResponse(params?.page, 'No slug provided')

	// if anyone attempts to acces the rss feed, redirect them to the blog rss feed
	if (params.page.includes(`.xml`)) {
		throw redirect(`/blog/rss.xml`)
	}

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
	const { code, frontmatter } = data.page ?? { code: '', frontmatter: {} }
	const Component = useMdxComponent(String(code))

	return (
		<div className="mx-auto mt-6 min-h-[100vh] w-full max-w-screen-xl px-4 pb-24 md:mt-14 md:px-20">
			<div className="">
				<main className="prose prose-light relative max-w-7xl grid-cols-4 break-words dark:prose-dark">
					<H1>{frontmatter.title}</H1>

					{frontmatter.date ? (
						<Callout
							type={frontmatter?.callOutType ?? 'success'}
							description={`Last updated at: ${dateFormat(frontmatter.date)}`}
						/>
					) : null}
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
