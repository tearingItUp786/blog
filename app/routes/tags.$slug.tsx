import { H1, H2, H3 } from "~/components/typography";
import { getMdxIndividualTag } from "~/utils/mdx";
import { json, LoaderArgs } from "@remix-run/node";
import styles from "~/styles/til.css";
import { NavLink, useLoaderData, useParams } from "@remix-run/react";
import { ContentCard as GenericContentCard } from "~/components/til/content-card";
import { tilMapper } from "~/utils/til-list";
import { useMemo } from "react";

export async function loader({ params }: LoaderArgs) {
  if (!params.slug) {
    throw new Error("No slug provided");
  }

  const data = await getMdxIndividualTag(params.slug);
  return json({ ...data });
}

export default function SingleTag() {
  const { blogList, tilList } = useLoaderData<typeof loader>();
  const params = useParams();

  let tilComponents = useMemo(() => tilList.map(tilMapper), [tilList.length]);

  return (
    <div className="page-container">
      <div className="max-w-full prose prose-light dark:prose-dark">
        <H1 className="border-b-2 dark:border-b-white w-full mt-16">
          Today I learned about... <br />
          <span className="text-pink dark:opacity-80 text-5xl md:text-7xl  mt-2 block">
            {params.slug}
          </span>
        </H1>
        <NavLink to="/tags" className="no-underline">
          <H3>Back to all tags</H3>
        </NavLink>
        {tilComponents.map((til, i) => {
          const Component: any = tilComponents?.[i]?.component ?? null;
          if (!til?.frontmatter) return null;
          return (
            <div
              key={til.frontmatter.title}
              className="mb-20 last-of-type:mb-0 first-of-type:mt-12"
            >
              <GenericContentCard
                key={`${til.frontmatter.title}-${til.frontmatter.date}`}
                title={til.frontmatter.title}
                date={til.frontmatter.date}
                tag={til.frontmatter.tag}
                showBlackLine={false}
              >
                {Component ? <Component /> : null}
              </GenericContentCard>
            </div>
          );
        })}

        {blogList.map((blog) => {
          return (
            <div
              key={blog.frontmatter.title}
              className="mb-20 last-of-type:mb-0 first-of-type:mt-12"
            >
              <NavLink className="no-underline" to={`blog/${blog.slug ?? ""}`}>
                {/* TODO: figure how a generic component can be used here */}
                <GenericContentCard
                  key={`${blog.frontmatter.title}-${blog.frontmatter.date}`}
                  title={blog.frontmatter.title}
                  date={blog.frontmatter.date}
                  tag={blog.frontmatter.tag}
                  showBlackLine={false}
                >
                  <H3>
                    Blog post about:{" "}
                    {blog.frontmatter.subtitle ??
                      blog.frontmatter.description ??
                      "This blog entry needs a description"}
                  </H3>
                </GenericContentCard>
              </NavLink>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
