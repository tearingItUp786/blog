import React from "react";
import { json, LoaderFunction, NavLink, useCatch, useLoaderData } from "remix";
import type { MdxPage } from "types";
import { H1, H4 } from "~/components/typography";
import { getMdxPage, useMdxComponent } from "~/utils/mdx";

type LoaderData = {
  page: MdxPage;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  if (!params.slug) {
    throw new Error("params.slug is not defined");
  }
  const page = await getMdxPage({
    contentDir: "blog",
    slug: params.slug,
  }).catch(() => null);

  const headers = {
    "Cache-Control": "private, max-age=3600",
    Vary: "Cookie",
  };

  console.log("test", page);
  if (!page) {
    throw json({ error: true }, { status: 404, headers });
  }
  const data: LoaderData = { page };
  return json(data, { status: 200, headers });
};

export default function MdxScreen() {
  const data = useLoaderData<LoaderData>();
  const { code, frontmatter } = data.page;
  const Component = useMdxComponent(String(code));

  return (
    <>
      <div className="mb-10 mt-24 lg:mb-24">
        <div className="col-span-full flex justify-between lg:col-span-8 lg:col-start-3">
          <NavLink to="/">Back to home</NavLink>
        </div>
      </div>

      <div className="mb-12">
        <div className="col-span-full lg:col-span-8 lg:col-start-3">
          <H1>{frontmatter.title}</H1>
          {frontmatter.description ? (
            <H4 variant="secondary" className="mt-2">
              {frontmatter.description}
            </H4>
          ) : null}
        </div>
      </div>

      <main className="prose prose-light dark:prose-dark">
        <Component />
      </main>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  console.error("CatchBoundary", caught);
  return <div>Fucked up </div>;
}
