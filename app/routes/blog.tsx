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

  let hangRight = 0
  let blogElements = []
  let containerClassName = 'col-span-full'

  for (let i = 0; i < blogList.length; i++) {
    const blogElement = blogList[i]

    if (i !== 0 && hangRight < 2) {
      containerClassName = 'col-span-2 col-start-2'
      hangRight++
    } else if (hangRight >= 2 && hangRight < 4) {
      containerClassName = 'col-span-full'
      hangRight === 3 ? (hangRight = 0) : hangRight++
    }

    if (blogElement) {
      blogElements.push(
        <div key={blogElement.frontmatter.title} className={containerClassName}>
          <BlogCard {...blogElement.frontmatter} slug={blogElement.path} />
        </div>
      )
    }
  }

  return (
    <div className='max-w-5xl mx-auto relative mt-8'>
      <H2 className='text-pink text-lg font-normal text-center mb-4'>
        WELCOME
      </H2>
      <div
        className='
      absolute left-[50%] w-[2px] bg-black dark:bg-white hidden lg:block h-full
      after:content-[" "]
      after:absolute
      after:w-[18px]
      after:h-[18px]
      after:translate-y-[-50%]
      after:translate-x-[-45%]
      after:rounded-full
      after:bg-black
      after:dark:bg-white
      '
      ></div>
      <div className='grid grid-cols-2'>{blogElements}</div>
    </div>
  )
}

// need to compile each mdx file using mdx-bundler
// get the frontmatter and the code
// truncate the code to 300 characters without breaking the bundler
