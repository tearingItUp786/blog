import clsx from "clsx";
import { useLoaderData } from "@remix-run/react";
import { BlogCard } from "~/components/blog/blog-card";
import { H2 } from "~/components/typography";
import { getMdxBlogList, getMdxBlogListGraphql } from "~/utils/mdx";
import styles from "~/styles/blog.css";
import {
  getBlogCardClassName,
  getContainerClassName,
  getRandomLineClasses,
} from "~/utils/blog-list";
import { json, LoaderFunction } from "@remix-run/node";

type LoaderData = {
  blogList: Awaited<ReturnType<typeof getMdxBlogList>>;
  cssClasses: { left: string[]; right: string[] };
};

export const loader: LoaderFunction = async () => {
  const blogList = await getMdxBlogListGraphql();

  const cssClasses = blogList.reduce(
    (acc) => {
      acc.left.push(getRandomLineClasses("left"));
      acc.right.push(getRandomLineClasses("right"));
      return acc;
    },
    { left: [], right: [] } as LoaderData["cssClasses"]
  );

  return json<LoaderData>({ blogList, cssClasses });
};

export default function Blog() {
  const { blogList, cssClasses } = useLoaderData() as LoaderData;
  let shouldHangRight = true;
  let blogElements: Array<React.ReactNode> = [];

  for (
    let i = 1;
    i < blogList.length;
    i += 2, shouldHangRight = !shouldHangRight
  ) {
    [blogList[i], blogList[i + 1]].forEach((el, j) => {
      let currentIndex = i + j;
      let currentContainerClassName = getContainerClassName(shouldHangRight);
      let currentBlogClassName = clsx(
        getBlogCardClassName(shouldHangRight),
        cssClasses[shouldHangRight ? "right" : "left"][currentIndex]
      );

      if (el) {
        blogElements.push(
          <div key={el.path} className={currentContainerClassName}>
            <BlogCard
              {...el.frontmatter}
              className={currentBlogClassName}
              slug={el.path}
            />
          </div>
        );
      }
    });
  }

  const firstElement = blogList[0];

  return (
    <div className="blog-container">
      <H2 className="welcome-message">WELCOME</H2>
      <div className="grid grid-cols-2 max-w-5xl mx-auto pt-0 md:pt-4">
        {firstElement ? (
          <div
            key={firstElement.frontmatter.title}
            className={getContainerClassName()}
          >
            <BlogCard
              {...firstElement.frontmatter}
              className={clsx(
                getBlogCardClassName(),
                "after:w-[1.5rem] pt-2 md:pt-6"
              )}
              slug={firstElement.path}
            />
          </div>
        ) : null}
        {blogElements}
      </div>
    </div>
  );
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
