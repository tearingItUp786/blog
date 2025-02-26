import clsx from 'clsx'
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	type ShouldRevalidateFunctionArgs,
	useLoaderData,
} from 'react-router'
import { twMerge } from 'tailwind-merge'
import { BlogCard } from './blog-card'
import {
	getBlogCardClassName,
	getContainerClassName,
	getRandomLineClasses,
} from '~/utils/blog-list'
import { getMdxBlogListGraphql } from '~/utils/mdx-utils.server'

// css
import '~/styles/blog.css'

export const meta: MetaFunction<typeof loader> = () => {
	return [
		{
			title: `Taran "tearing it up" Bains | Blog | Blog timeline`,
		},
		{
			name: 'description',
			content: 'The blog timeline for Taran Bains',
		},
	]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const showDrafts = new URL(request.url).searchParams.has('showDrafts')
	const { publishedPages, draftPages } = await getMdxBlogListGraphql()

	const blogList =
		process.env.NODE_ENV === 'production' && !showDrafts
			? publishedPages
			: [...draftPages, ...publishedPages]

	const cssClasses = blogList.reduce(
		(acc) => {
			acc.left.push(getRandomLineClasses('left'))
			acc.right.push(getRandomLineClasses('right'))
			return acc
		},
		{ left: [], right: [] } as Record<'left' | 'right', string[]>,
	)

	return { blogList, cssClasses }
}

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

export default function Blog() {
	// typescript is complaining that we are possibly calling useLoaderData in a loop... but we're not
	// eslint-disable-next-line
	const { blogList, cssClasses } = useLoaderData<typeof loader>()
	let shouldHangRight = true
	const blogElements: Array<React.ReactNode> = []

	for (
		let i = 1;
		i < blogList.length;
		i += 2, shouldHangRight = !shouldHangRight
	) {
		// prettier-ignore
		;[blogList[i], blogList[i + 1]].forEach((el, j) => {
      const currentIndex = i + j
      const currentContainerClassName = getContainerClassName(shouldHangRight)
      const currentBlogClassName = clsx(
        getBlogCardClassName(shouldHangRight),
        cssClasses[shouldHangRight ? 'right' : 'left'][currentIndex],
      )

      if (el && el.path) {
        blogElements.push(
          <div key={el.path} className={currentContainerClassName}>
            <BlogCard
              {...el.frontmatter}
              className={currentBlogClassName}
              slug={el.path}
              descriptionClassName={!shouldHangRight ? 'md:text-right' : ''}
            />
          </div>,
        )
      }
    })
	}

	const firstElement = blogList[0]

	return (
		<div
			className={twMerge(
				'relative mt-8 px-4 pb-8 before:hidden before:content-[""] md:px-20 md:before:block',
				'before:absolute before:left-[50%] before:top-[40px] before:h-[18px] before:w-[18px] before:-translate-x-1/2 before:rounded-full before:bg-charcoal-gray before:dark:bg-white',
				'after:absolute after:bottom-0 after:left-[50%] after:top-[50px] after:hidden after:w-[2px] after:bg-charcoal-gray after:content-[""] after:dark:bg-white md:after:block',
			)}
		>
			<h2 className="mb-4 text-center text-lg font-normal text-accent dark:text-pink dark:opacity-80">
				WELCOME
			</h2>
			<div className="mx-auto grid max-w-5xl grid-cols-2 pt-0 md:pt-4">
				{firstElement && firstElement.path ? (
					<div
						key={firstElement.frontmatter.title}
						className={getContainerClassName()}
					>
						<BlogCard
							{...firstElement.frontmatter}
							className={twMerge(
								getBlogCardClassName(),
								'pt-2 after:w-[1.5rem] md:pt-6',
							)}
							descriptionClassName="md:text-right"
							slug={firstElement.path}
						/>
					</div>
				) : null}
				{blogElements}
			</div>
		</div>
	)
}
