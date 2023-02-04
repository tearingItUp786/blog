import React from "react";
import * as mdxBundler from "mdx-bundler/client";
import * as myTypo from "~/components/typography";
import type { GitHubFile, MdxPage, MdxPageAndSlug } from "types";
import _ from "lodash";
import {
  downloadDirList,
  downloadMdxFileOrDirectory,
} from "~/utils/github.server";
import { compileMdx } from "./mdx.server";
import { redisCache } from "./redis.server";
import cachified, { verboseReporter } from "cachified";

const checkCompiledValue = (value: unknown) =>
  typeof value === "object" &&
  (value === null || ("code" in value && "frontmatter" in value));

async function downloadMdxFilesCached(fullPath: string) {
  const key = `${fullPath}:downloaded`;

  const downloaded = await cachified({
    cache: redisCache,
    key,
    checkValue: (value: unknown) => {
      if (typeof value !== "object") {
        return `value is not an object`;
      }
      if (value === null) {
        return `value is null`;
      }

      const download = value as Record<string, unknown>;
      if (!Array.isArray(download.files)) {
        return `value.files is not an array`;
      }
      if (typeof download.entry !== "string") {
        return `value.entry is not a string`;
      }

      return true;
    },
    forceFresh: true,
    getFreshValue: async () => downloadMdxFileOrDirectory(fullPath),
  });
  // if there aren't any files, remove it from the cache
  if (!downloaded.files.length) {
    void redisCache.delete(key);
  }
  return downloaded;
}

async function getMdxPage({
  contentDir,
  slug,
}: {
  contentDir: string;
  slug: string;
}): Promise<MdxPage | null> {
  return cachified({
    key: `${contentDir}:${slug}`,
    cache: redisCache,
    forceFresh: true,
    getFreshValue: async () => {
      const pageFiles = await downloadMdxFilesCached(`${contentDir}/${slug}`);

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
    },
    reporter: verboseReporter(),
  });
}

const mdxComponents = {
  ...myTypo,
};

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
      <Component components={{ ...mdxComponents, ...components }} {...rest} />
    );
  }
  return KCDMdxComponent;
}

async function getMdxDirList(contentDir: string) {
  const fullContentDirPath = `content/${contentDir}`;

  return cachified({
    key: `getMdxDirList-${fullContentDirPath}`,
    cache: redisCache,
    // forceFresh: true,
    getFreshValue: async () => {
      const dirList = (await downloadDirList(fullContentDirPath)).map(
        ({ name, path, ...rest }) => ({
          name,
          slug: path.replace("index.mdx", "").replace("content/", ""),
          ...rest,
        })
      );

      // sort by the most recent to the oldest
      return dirList.sort((a, b) => {
        return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
      });
    },
    reporter: verboseReporter(),
  });
}

async function getMdxTilList(page = 1) {
  return cachified({
    key: `til-list:${page}`,
    cache: redisCache,
    // forceFresh: true,
    getFreshValue: async () => {
      const mdxDirList = await getMdxDirList("til");
      const itemCount = 20;
      const dirList: Awaited<ReturnType<typeof getMdxDirList>> = _.chunk(
        mdxDirList,
        itemCount
      )[page - 1];

      if (!dirList) return [];

      const pageDatas = await Promise.all(
        dirList.map(async ({ slug }) => {
          return {
            ...(await downloadMdxFilesCached(slug)),
            slug,
          };
        })
      );

      const pages = await Promise.all(
        pageDatas.map((pageData) => compileMdx(pageData.slug, pageData.files))
      );

      let test = pages.map((page, i) => {
        return {
          ...page,
          path: pageDatas?.[i]?.slug ?? "",
        } as MdxPageAndSlug;
      });
      return test;
    },
  });
}

async function getMdxBlogList() {
  return cachified({
    key: "blog-list",
    cache: redisCache,
    // forceFresh: true,
    getFreshValue: async () => {
      const dirList = await getMdxDirList("blog");

      const pageDatas = await Promise.all(
        dirList.map(async ({ slug }) => {
          return {
            ...(await downloadMdxFilesCached(slug)),
            slug,
          };
        })
      );

      const pages = await Promise.all(
        pageDatas.map((pageData) => compileMdx(pageData.slug, pageData.files))
      );

      return pages
        .map((page, i) => {
          if (!page) return null;
          return {
            ...mapFromMdxPageToMdxListItem(page),
            path: pageDatas?.[i]?.slug ?? "",
          };
        })
        .filter((v) => v && Boolean(v.path));
    },
  });
}

async function getMdxTagList() {
  return cachified({
    key: "tag-list",
    cache: redisCache,
    // forceFresh: true,
    getFreshValue: async () => {
      // fetch all the content for til and blog from github
      // then go through the content and pluck out the tag field from the frontmatter;
      const contentDirList = await Promise.all([
        getMdxDirList("blog"),
        getMdxDirList("til"),
      ]);

      const contentDirListFlat = contentDirList.flat();

      const contentData = await Promise.all(
        contentDirListFlat.flatMap(async ({ slug }) => {
          return {
            ...(await downloadMdxFilesCached(slug)),
            slug,
          };
        })
      );

      const tags = contentData.reduce((acc, { files }) => {
        const firstMdxFile = files.find((file) => file.path.endsWith(".mdx"));
        if (!firstMdxFile) return acc;
        const tag = firstMdxFile.content.match(/tag: (.*)/)?.[1]?.toUpperCase();

        if (!tag) return acc;
        if (!acc.get(tag)) {
          acc.set(tag, 0);
        }
        let currentCount = acc.get(tag) ?? 0;
        acc.set(tag, currentCount + 1);
        return acc;
      }, new Map());

      let groupTags: {
        [key: string]: Array<{ name: string; value: number }>;
      } = _.groupBy(
        Array.from(tags, ([name, value]) => ({ name, value })),
        (v: { name: string; value: string }) => {
          // console.log('group by', v)
          return v.name[0];
        }
      );
      return groupTags;
    },
    reporter: verboseReporter(),
  });
}

// TODO: clean this up so that it's not so repetitive
async function getMdxIndividualTag(userProvidedTag: string) {
  return cachified({
    key: `tag:${userProvidedTag}`,
    cache: redisCache,
    // forceFresh: true,
    getFreshValue: async () => {
      // fetch all the content for til and blog from github
      // then go through the content and pluck out the tag field from the frontmatter;
      let getBlogKeyObject = async () => ({
        blog: await getMdxDirList("blog"),
      });
      let getTilKeyObject = async () => ({ til: await getMdxDirList("til") });

      const contentDirList = await Promise.all([
        getBlogKeyObject(),
        getTilKeyObject(),
      ]);

      let retObject = await Promise.all(
        contentDirList.map(async (v) => {
          const [key, value] = Object.entries(v)?.[0] ?? [];
          if (!key) throw new Error("no key for content dir list");
          if (!value) throw new Error("no value for content dir list");

          let possibleValues = await Promise.all(
            value.map(async (pageData) => {
              return {
                ...(await downloadMdxFilesCached(pageData.slug)),
                slug: pageData.slug,
              };
            })
          );

          let filteredValues = possibleValues.filter(
            ({ files }: { files: Array<GitHubFile> }) => {
              const firstMdxFile = files.find((file) =>
                file.path.endsWith(".mdx")
              );
              if (!firstMdxFile) return false;
              // break out this regex
              const tag = firstMdxFile.content
                .match(/tag: (.*)/)?.[1]
                ?.toUpperCase();

              return tag === userProvidedTag.toUpperCase();
            }
          );

          let retArray = await Promise.all(
            filteredValues.map(async (pageData) => {
              let data = await compileMdx(pageData.slug, pageData.files);
              return {
                ...data,
                slug: pageData.slug,
              };
            })
          );

          return retArray as Array<MdxPageAndSlug>;
        })
      );

      return {
        blogList: retObject?.[0]?.map(mapFromMdxPageToMdxListItem) ?? [],
        tilList: retObject?.[1] ?? [],
        retObject,
      };
    },
  });
}

function mapFromMdxPageToMdxListItem(
  page: MdxPage
): Omit<MdxPageAndSlug, "code"> {
  const { code, ...mdxListItem } = page;
  return mdxListItem;
}

function useMdxComponent(code: string) {
  return React.useMemo(() => getMdxComponent(code), [code]);
}

export {
  getMdxPage,
  getMdxBlogList,
  getMdxTilList,
  useMdxComponent,
  getMdxComponent,
  getMdxTagList,
  mdxComponents,
  getMdxIndividualTag,
  downloadMdxFilesCached,
};
