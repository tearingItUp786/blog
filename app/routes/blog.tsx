import clsx from 'clsx'
import {useLoaderData} from '@remix-run/react'
import {BlogCard} from '~/components/blog/blog-card'
import {getMdxBlogListGraphql} from '~/utils/mdx'
import styles from '~/styles/blog.css'
import {
  getBlogCardClassName,
  getContainerClassName,
  getRandomLineClasses,
} from '~/utils/blog-list'
import type {LoaderFunction} from '@remix-run/node'
import {json} from '@remix-run/node'

export const loader: LoaderFunction = async () => {
  const allBlogItems = await getMdxBlogListGraphql()
  const blogList = allBlogItems.filter(el =>
    process.env.NODE_ENV === 'production' ? !el.frontmatter.draft : true,
  )

  const cssClasses = blogList.reduce(
    acc => {
      acc.left.push(getRandomLineClasses('left'))
      acc.right.push(getRandomLineClasses('right'))
      return acc
    },
    {left: [], right: []} as Record<'left' | 'right', string[]>,
  )

  return json({blogList, cssClasses})
}

export default function Blog() {
  const {blogList, cssClasses} = useLoaderData<typeof loader>()
  let shouldHangRight = true
  let blogElements: Array<React.ReactNode> = []

  for (
    let i = 1;
    i < blogList.length;
    i += 2, shouldHangRight = !shouldHangRight
  ) {
    ;[blogList[i], blogList[i + 1]].forEach((el, j) => {
      let currentIndex = i + j
      let currentContainerClassName = getContainerClassName(shouldHangRight)
      let currentBlogClassName = clsx(
        getBlogCardClassName(shouldHangRight),
        cssClasses[shouldHangRight ? 'right' : 'left'][currentIndex],
      )

      if (el) {
        blogElements.push(
          <div key={el.path} className={currentContainerClassName}>
            <BlogCard
              {...el.frontmatter}
              className={currentBlogClassName}
              slug={el.path}
            />
          </div>,
        )
      }
    })
  }

  const firstElement = blogList[0]

  return (
    <div
      className={clsx(
        'relative mx-[10vw] mt-8 pb-8 before:hidden before:content-[""] md:before:block',
        'before:absolute before:left-[50%] before:top-[40px] before:h-[18px] before:w-[18px] before:-translate-x-1/2 before:rounded-full before:bg-gray-300 before:dark:bg-white',
        'after:absolute after:top-[50px] after:left-[50%] after:bottom-0 after:hidden after:w-[2px] after:bg-gray-300 after:content-[""] after:dark:bg-white md:after:block',
      )}
    >
      <h2 className="mb-4 text-center text-lg font-normal text-accent dark:text-pink dark:opacity-80">
        WELCOME
      </h2>
      <div className="mx-auto grid max-w-5xl grid-cols-2 pt-0 md:pt-4">
        {firstElement ? (
          <div
            key={firstElement.frontmatter.title}
            className={getContainerClassName()}
          >
            <BlogCard
              {...firstElement.frontmatter}
              className={clsx(
                getBlogCardClassName(),
                'pt-2 after:w-[1.5rem] md:pt-6',
              )}
              slug={firstElement.path}
            />
          </div>
        ) : null}
        {blogElements}
      </div>
    </div>
  )
}

export function links() {
  return [{rel: 'stylesheet', href: styles}]
}
