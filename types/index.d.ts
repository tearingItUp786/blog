import type calculateReadingTime from "reading-time";

export type GitHubFile = { path: string; content: string };

export type MdxPage = {
  code?: string;
  slug?: string;
  readTime?: ReturnType<typeof calculateReadingTime>;

  frontmatter: {
    title?: string;
    subtitle?: string;
    description?: string;
    date?: string;
    tag?: string;
  };
};
