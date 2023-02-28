import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { ContentCard } from "~/components/til/content-card";
import { getMdxTilListGql } from "~/utils/mdx";
import { tilMapper } from "~/utils/til-list";

export async function loader() {
  const tilList = await getMdxTilListGql();

  return json({ tilList });
}

export default function TilPage() {
  const { tilList } = useLoaderData<typeof loader>();

  let tilComponents = React.useMemo(
    () => tilList.map(tilMapper),
    [tilList.length]
  );

  return (
    <div
      className='
    md:ml-[18vw] ml-[10vw] mr-[10vw] pb-8 relative mt-8
    after:hidden
    after:md:block
    after:content-[""]
    after:absolute
    after:top-[10px]
    after:left-[-13vw]
    after:h-full
    after:w-[2px]
    after:bg-gray-100
    after:dark:bg-white
    '
    >
      <div className="max-w-full prose prose-light dark:prose-dark">
        {tilComponents.map((til, i) => {
          const Component: any = tilComponents?.[i]?.component ?? null;
          if (!til?.frontmatter) return null;

          return (
            <div
              key={`${til.frontmatter.title}-${til.frontmatter.date}`}
              className="mb-24 last-of-type:mb-0 first-of-type:mt-16"
            >
              <ContentCard
                title={til.frontmatter.title}
                date={til.frontmatter.date}
                tag={til.frontmatter.tag}
              >
                {Component ? <Component /> : null}
              </ContentCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
