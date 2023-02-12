import { bundleMDX } from "mdx-bundler";
import remarkEmbedder from "@remark-embedder/core";
import oembedTransformer, { Config } from "@remark-embedder/transformer-oembed";
import calculateReadingTime from "reading-time";
import type * as H from "hast";
import type TPQueue from "p-queue";
import type { TransformerInfo } from "@remark-embedder/core";
import type { GitHubFile } from "types";
import type { BuildVisitor, VisitorResult } from "unist-util-visit";

function handleEmbedderError({ url }: { url: string }) {
  return `<p>Error embedding <a href="${url}">${url}</a></p>.`;
}

type GottenHTML = string | null;

function handleEmbedderHtml(html: GottenHTML, info: TransformerInfo) {
  if (!html) return null;

  const url = new URL(info.url);
  // matches youtu.be and youtube.cm
  if (/youtu\.?be/.test(url.hostname)) {
    // this allows us to set youtube embeds to 100% width and the
    // height will be relative to that width with a good aspect ratio
    return makeEmbed(html, "youtube");
  }
  if (url.hostname.includes("codesandbox.io")) {
    return makeEmbed(html, "codesandbox", "80%");
  }
  return html;
}

function makeEmbed(html: string, type: string, heightRatio = "56.25%") {
  return `
  <div class="embed" data-embed-type="${type}">
    <div style="padding-bottom: ${heightRatio}">
      ${html}
    </div>
  </div>
`;
}

type Options = {
  className?: string;
  titleSeparator?: string;
};

function myRehypeCodeTitles(
  {
    className = "rehype-configurable-code-title",
    titleSeparator = ":title=",
  }: Options = {
      titleSeparator: ":title=",
      className: "rehype-configurable-code-title",
    }
) {
  return async function transformer(tree: H.Root) {
    const { visit } = await import("unist-util-visit");

    const visitor: BuildVisitor<H.Root, "element"> = (
      node,
      index,
      parent
    ): VisitorResult => {
      if (!parent || node.tagName !== "pre") {
        return;
      }

      const [code] = node.children;

      let oldClassName = (code as H.Element)?.properties?.className ?? [];

      // the old class name that we want to update can be an array or just a primitive value (not a sclar)
      let cls = Array.isArray(oldClassName) ? oldClassName : [oldClassName];

      const updatedCls = cls.reduce((acc, currClassName) => {
        // split `language-Javascript:title=My title`
        // into ["language-Javascript", "My title"]
        // the split is based on the titleSeparator and can be changed
        const [language, title] = String(currClassName)?.split(titleSeparator);

        if (title && language && index) {
          // we want to insert the title before the pre element
          // splicing at the current index of the node and not deleting
          // will allow us to do the insert
          parent.children.splice(index, 0, {
            children: [{ type: "text", value: title }],
            properties: { className: [className] },
            tagName: "div",
            type: "element",
          });

          acc.push(language);
          return acc;
        }

        if (
          typeof currClassName === "string" &&
          currClassName.slice(0, 9) === "language-"
        ) {
          // this should always be a string
          acc.push(currClassName);
          return acc;
        }

        acc.push(String(currClassName));

        return acc;
      }, [] as Array<string>);

      // append the node with the class name stripped of the "title" part
      // so that prism can do its thing
      if (code) {
        let newElement = {
          ...(code as H.Element),
          properties: { className: updatedCls },
        };

        node.children = [{ ...newElement }];
      }
    };

    visit(tree, "element", visitor);
  };
}

//TODO: come up with a uninst transformer to get rid of the `title`

async function compileMdx<FrontmatterType extends Record<string, unknown>>(
  slug: string,
  githubFiles: Array<GitHubFile>
) {
  const { default: remarkAutolinkHeadings } = await import(
    "remark-autolink-headings"
  );
  const { default: gfm } = await import("remark-gfm");
  const { default: capitalize } = await import("remark-capitalize");
  const { default: emoji } = await import("remark-emoji");
  const { default: smartypants } = await import("remark-smartypants");
  const { default: remarkImages } = await import("remark-images");
  // rehype plugins
  const { default: rehypePrismPlus } = await import("rehype-prism-plus");
  const { default: rehypeSlug } = await import("rehype-slug");
  const { default: rehypeAutolinkHeadings } = await import(
    "rehype-autolink-headings"
  );
  const { default: rehypeCodeTitles } = await import("rehype-code-titles");
  const { default: rehypeAddClasses } = await import("rehype-add-classes");

  const mdxRegex = new RegExp(`${slug}\\/.*mdx?$`);
  const mdxFile = githubFiles.find(({ path }) => mdxRegex.test(path));
  if (!mdxFile) return null;

  // const rootDir = mdxFile.path.replace(/index.mdx?$/, '')
  const rootDir = mdxFile.path
    .trim()
    .split("/")
    .filter((v) => !v.includes("mdx"))
    .join("/");

  // console.log("root dir", rootDir);

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

  // console.log("files are", files);

  try {
    const { frontmatter, code } = await bundleMDX({
      source: mdxFile.content,
      files,
      mdxOptions(options) {
        options.remarkPlugins = [
          ...(options.remarkPlugins ?? []),
          capitalize,
          emoji,
          gfm,
          smartypants,
          [remarkImages, { maxWidth: 1200 }],
          [remarkAutolinkHeadings, { behavior: "wrap" }],
          [
            remarkEmbedder,
            {
              handleError: handleEmbedderError,
              handleHTML: handleEmbedderHtml,
              transformers: [
                [
                  oembedTransformer,
                  {
                    params: {
                      height: "390",
                      width: "1280",
                    } as Config,
                  },
                ],
              ],
            },
          ],
        ];
        options.rehypePlugins = [
          ...(options.rehypePlugins ?? []),
          myRehypeCodeTitles,
          // rehypeCodeTitles,
          [rehypePrismPlus, { showLineNumbers: true }],
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "prepend",
              properties: {
                tabIndex: 0,
              },
              content: {
                type: "element",
                tagName: "svg",
                properties: {
                  ariaHidden: true,
                  focusable: false,
                  viewBox: "0 0 16 16",
                  height: 16,
                  width: 16,
                },
                children: [
                  {
                    type: "element",
                    tagName: "path",
                    properties: {
                      fillRule: "evenodd",
                      d: `M4 9h1v1H4c - 1.5 0-3 - 1.69 - 3 - 3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41 - .91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c - .98 0-2 1.22-2 2.5S3 9 4 9zm9 - 3h- 1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c - .98 0 - 2 - 1.22 - 2 - 2.5 0 - .83.42 - 1.64 1 - 2.09V6.25c - 1.09.53 - 2 1.84 - 2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3 - 1.69 3 - 3.5S14.5 6 13 6z`,
                    },
                  },
                ],
              },
            },
          ],
          [rehypeAddClasses, { "h1,h2,h3,h4,h5,h6": "title" }],
        ];
        return options;
      },
    });
    const readTime = calculateReadingTime(mdxFile.content);

    return {
      code,
      readTime,
      frontmatter: frontmatter as FrontmatterType,
    };
  } catch (error: unknown) {
    console.error(`Compilation error for slug: `, slug);
    // @ts-ignore
    console.error(error.errors[0]);
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
      throw new Error(`${String(keyName)} of item must be a string`);
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

  _queue = new PQueue({ concurrency: 4 });
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
