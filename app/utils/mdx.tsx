import React from "react";
import * as mdxBundler from "mdx-bundler/client";

import type { MdxPage } from "types";
import {
  downloadDirList,
  downloadMdxFileOrDirectory,
} from "~/utils/github.server";
import { compileMdx } from "./mdx.server";

const checkCompiledValue = (value: unknown) =>
  typeof value === "object" &&
  (value === null || ("code" in value && "frontmatter" in value));

export async function getMdxPage({
  contentDir,
  slug,
}: {
  contentDir: string;
  slug: string;
}): Promise<MdxPage | null> {
  console.log("test", contentDir, slug);
  const pageFiles = await downloadMdxFileOrDirectory(`${contentDir}/${slug}`);
  const compiledPage = await compileMdx<MdxPage["frontmatter"]>(
    slug,
    pageFiles.files
  ).catch((err) => {
    console.error(`Failed to compile mdx:`, {
      contentDir,
      slug,
    });
    return Promise.reject(err);
  });

  return compiledPage;
}

/**
 * This should be rendered within a useMemo
 * @param code the code to get the component from
 * @returns the component
 */
function getMdxComponent(code: string) {
  const Component = mdxBundler.getMDXComponent(code);
  function KCDMdxComponent({
    components,
    ...rest
  }: Parameters<typeof Component>["0"]) {
    return (
      // @ts-expect-error the types are wrong here
      <Component components={{ ...mdxComponents, ...components }} {...rest} />
    );
  }
  return KCDMdxComponent;
}

export function useMdxComponent(code: string) {
  return React.useMemo(() => getMdxComponent(code), [code]);
}
