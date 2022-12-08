import { bundleMDX } from "mdx-bundler";

import calculateReadingTime from "reading-time";
import type TPQueue from "p-queue";
import type { GitHubFile } from "types";

async function compileMdx<FrontmatterType extends Record<string, unknown>>(
  slug: string,
  githubFiles: Array<GitHubFile>
) {
  const { default: remarkAutolinkHeadings } = await import(
    "remark-autolink-headings"
  );
  const { default: remarkSlug } = await import("remark-slug");
  const { default: gfm } = await import("remark-gfm");
  const { default: capitalize } = await import("remark-capitalize");
  const { default: emoji } = await import("remark-emoji");
  const { default: smartypants } = await import("remark-smartypants");
  const { default: remarkImages } = await import("remark-images");
  // rehype plugins
  const { default: rehypeCodeTitles } = await import("rehype-code-titles");
  const { default: rehypePrismPlus } = await import("rehype-prism-plus");



  const indexRegex = new RegExp(`${slug}\\/index.mdx?$`);
  const indexFile = githubFiles.find(({ path }) => indexRegex.test(path));
  if (!indexFile) return null;

  const rootDir = indexFile.path.replace(/index.mdx?$/, "");
  const relativeFiles: Array<GitHubFile> = githubFiles.map(
    ({ path, content }) => ({
      path: path.replace(rootDir, "./"),
      content,
    })
  );
  const files = arrayToObj(relativeFiles, {
    keyName: "path",
    valueName: "content",
  });

  try {
    const { frontmatter, code } = await bundleMDX({
      source: indexFile.content,
      files,
      cwd: "/app/components/",
      mdxOptions(options) {
        options.remarkPlugins = [
          ...(options.remarkPlugins ?? []),
          remarkSlug,
          capitalize,
          emoji,
          gfm,
          smartypants,
          [remarkImages, { maxWidth: 1200 }],
          [remarkAutolinkHeadings, { behavior: "wrap" }],
        ];
        options.rehypePlugins = [...(options.rehypePlugins ?? []),
          rehypeCodeTitles,
         [rehypePrismPlus, { showLineNumbers: true  }]
        ];
        return options;
      },
    });
    const readTime = calculateReadingTime(indexFile.content);

    return {
      code,
      readTime,
      frontmatter: frontmatter as FrontmatterType,
    };
  } catch (error: unknown) {
    console.error(`Compilation error for slug: `, slug);
    throw error;
  }
}

function arrayToObj<ItemType extends Record<string, unknown>>(
  array: Array<ItemType>,
  { keyName, valueName }: { keyName: keyof ItemType; valueName: keyof ItemType }
) {
  const obj: Record<string, ItemType[keyof ItemType]> = {};
  for (const item of array) {
    const key = item[keyName];
    if (typeof key !== "string") {
      throw new Error(`${keyName} of item must be a string`);
    }
    const value = item[valueName];
    obj[key] = value;
  }
  return obj;
}

let _queue: TPQueue | null = null;
async function getQueue() {
  const { default: PQueue } = await import("p-queue");
  if (_queue) return _queue;

  _queue = new PQueue({ concurrency: 1 });
  return _queue;
}

// We have to use a queue because we can't run more than one of these at a time
// or we'll hit an out of memory error because esbuild uses a lot of memory...
async function queuedCompileMdx<
  FrontmatterType extends Record<string, unknown>
>(...args: Parameters<typeof compileMdx>) {
  const queue = await getQueue();
  const result = await queue.add(() => compileMdx<FrontmatterType>(...args));
  return result;
}

export { queuedCompileMdx as compileMdx };
