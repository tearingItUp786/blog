import {
	type MetaFunction,
	NavLink,
	type ShouldRevalidateFunctionArgs,
	useLoaderData,
	useSearchParams,
} from 'react-router'
import { twMerge } from 'tailwind-merge'
import { PILL_CLASS_NAME, PILL_CLASS_NAME_ACTIVE } from '~/components/pill'
import { H1, H2 } from '~/components/typography'
import { getMdxTagListGql } from '~/utils/mdx-utils.server'

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
			title: `Taran "tearing it up" Bains | tags`,
			description: '',
		},
		{
			name: 'description',
			content: 'A list of tags used on this blog',
		},
	]
}

export async function loader() {
	const allData = await getMdxTagListGql()
	return { ...allData }
}

export default function TagPage() {
	const { tagList } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()

	return (
		<div className="relative mx-auto mb-4 mt-6 min-h-[100vh] w-full max-w-screen-xl px-4 pb-24 md:mb-10 md:mt-14 md:px-20">
			<main className="">
				<H1>Tags</H1>
				<div className="mt-8">
					{tagList.map(([firstLetter, tags]) => {
						return (
							<div key={firstLetter} className="mb-20 ml-4 last-of-type:mb-0">
								<H2>{firstLetter}</H2>
								<ul className="md:flex md:flex-wrap">
									{tags.map((tag) => {
										return (
											<li
												key={tag.name}
												className="mb-4 uppercase first-of-type:ml-0 last-of-type:mr-0 md:mb-0 md:ml-6 md:first-of-type:ml-6"
											>
												<NavLink
													prefetch="intent"
													className={twMerge(
														PILL_CLASS_NAME,
														PILL_CLASS_NAME_ACTIVE,
														'px-2 py-1',
													)}
													to={`/tags/${tag.name}?${searchParams.toString()}`}
												>
													{' '}
													{`${tag.name} [${tag.value}]`}
												</NavLink>
											</li>
										)
									})}
								</ul>
							</div>
						)
					})}
				</div>
			</main>
		</div>
	)
}
