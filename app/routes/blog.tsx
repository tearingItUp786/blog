import { json, LoaderFunction, useLoaderData } from 'remix'
import { BlogCard } from '~/components/blog/blog-card'
import { H2 } from '~/components/typography'
import { getMdxBlogList } from '~/utils/mdx'

type LoaderData = {
  blogList: Awaited<ReturnType<typeof getMdxBlogList>>
}

export const loader: LoaderFunction = async () => {
  const blogList = await getMdxBlogList()

  return json<LoaderData>({ blogList })
}

export default function Blog() {
  const { blogList } = useLoaderData() as LoaderData

  let hangRight = true
  let blogElements: Array<React.ReactNode> = []
  let containerClassName = 'col-span-full text-right'
  let blogClassName = 'max-w-[50%] pr-8'
  const firstElement = blogList[0]

  for (let i = 1; i < blogList.length; i += 2, hangRight = !hangRight) {
    let rightContainerClassName = 'col-span-2 col-start-2'
    let rightBlogClassName = 'max-w-full pl-8 after:left-0'

      ;[blogList[i], blogList[i + 1]].forEach((el) => {
        if (el) {
          blogElements.push(
            <div
              key={el.path}
              className={hangRight ? rightContainerClassName : containerClassName}
            >
              <BlogCard
                {...el.frontmatter}
                className={hangRight ? rightBlogClassName : blogClassName}
                slug={el.path}
              />
            </div>
          )
        }
      })
  }

  return (
    <div
      className='
      mx-[10vw]
      relative 
      mt-8
      after:content-[" "]
      after:absolute
      after:top-[40px]
      after:left-[50%]
      after:bottom-0
      after:w-[2px]
      after:bg-black
      after:dark:bg-white
    '
    >
      <H2 className='text-pink dark:text-pink dark:opacity-80 text-lg font-normal text-center mb-4'>
        WELCOME
      </H2>
      <div className='grid grid-cols-2 max-w-5xl mx-auto'>
        {firstElement ? (
          <div
            key={firstElement.frontmatter.title}
            className='col-span-full text-right'
          >
            <BlogCard
              {...firstElement.frontmatter}
              className={blogClassName}
              slug={firstElement.path}
            />
          </div>
        ) : null}
        {blogElements}
      </div>
    </div>
  )
}
