const capitalize = require(`remark-capitalize`)
const fs = require("fs")
const emoji = require(`remark-emoji`)
const remark = require("remark")
const mdx = require("remark-mdx")
const visit = require("unist-util-visit")
const frontmatter = require("remark-frontmatter")

function isTIL(slug) {
  return slug[0] !== "/"
}

module.exports = {
  siteMetadata: {
    title: `Taran "tearing it up" Bains`,
    author: `Taran "tearing it up" Bains`,
    description: `A home for the mostly developer thoughts of Taran Bains`,
    siteUrl: `https://taranveerbains.ca`,
    social: {
      twitter: `tearingItUp786`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {},
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/til`,
        name: `til`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: "gatsby-remark-embed-video",
            options: {
              // width: 800,
              // ratio: 1.77, // Optional: Defaults to 16/9 = 1.77
              // height: 400, // Optional: Overrides optional.ratio
              related: false, //Optional: Will remove related videos from the end of an embedded YouTube video.
              noIframeBorder: true, //Optional: Disable insertion of <style> border: 0
              loadingStrategy: "lazy", //Optional: Enable support for lazy-load offscreen iframes. Default is disabled.
              urlOverrides: [
                {
                  id: "youtube",
                  embedURL: (videoId) =>
                    `https://www.youtube-nocookie.com/embed/${videoId}`,
                },
              ], //Optional: Override URL of a service provider, e.g to enable youtube-nocookie support
              containerClass: "embedVideo-container", //Optional: Custom CSS class for iframe container, for multiple classes separate them by space
              iframeId: false, //Optional: if true, iframe's id will be set to what is provided after 'video:' (YouTube IFrame player API requires iframe id)
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
            },
          },
          "gatsby-remark-code-titles",
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          {
            resolve: "gatsby-remark-autolink-headers",
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              showLineNumbers: true,
            },
          },
        ],
        remarkPlugins: [capitalize, emoji],
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        //trackingId: `ADD YOUR TRACKING ID HERE`,
        trackingId: "UA-84833702-1",
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Taran "tearing it up" Blog`,
        short_name: `tearingItUp`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#f410a1`,
        display: `minimal-ui`,
        icon: `content/assets/taran-icon.png`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-lunr`,
      options: {
        languages: [
          {
            // ISO 639-1 language codes. See https://lunrjs.com/guides/language_support.html for details
            name: "en",
            // A function for filtering nodes. () => true by default
            filterNodes: () => true,
          },
        ],
        // Fields to index. If store === true value will be stored in index file.
        // Attributes for custom indexing logic. See https://lunrjs.com/docs/lunr.Builder.html for details
        fields: [
          { name: "title", store: true, attributes: { boost: 40 } },
          { name: "excerpt", store: true },
          { name: "type", store: true },
          { name: "url", store: true },
        ],
        // How to resolve each field's value for a supported node type
        resolvers: {
          // For any node of type MarkdownRemark, list how to resolve the fields' values
          Mdx: {
            title: (node) => node.frontmatter.title,
            excerpt: (node) => {
              const tree = remark()
                .use(mdx)
                .use(frontmatter, ["yaml"])
                .parse(node.rawBody)
              let excerpt = ""
              visit(tree, "text", (an) => {
                if (!an.value.match(/^import {?/gi)) {
                  if (!excerpt.match(/\s+$/gi)) {
                    excerpt += ` ${an.value}`
                  } else {
                    excerpt += an.value
                  }
                }
              })
              const length = 140
              const val = excerpt.slice(0, length) + "..."
              return val
            },
            type: (node) => (isTIL(node.fields.slug) ? "TIL" : "Blog"),
            content: (node) => node.rawBody,
            url: (node) => node.fields.slug,
          },
        },
        //custom index file name, default is search_index.json
        filename: "search_index.json",
        //custom options on fetch api call for search_ındex.json
        fetchOptions: {
          credentials: "same-origin",
        },
      },
    },
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        // Setting a color is optional.
        color: `#f410a1`,
        // Disable the loading spinner.
        showSpinner: false,
      },
    },
    {
      resolve: "gatsby-plugin-page-progress",
      options: {
        includePaths: [{ regex: "^/blog" }, { regex: "(?=til).*$" }],
        height: 3,
        prependToBody: false,
        color: `#f410a1`,
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /\.inline\.svg$/,
        },
      },
    },
    `gatsby-plugin-well-known`,
    {
      /* Include plugin */
      resolve: "gatsby-omni-font-loader",

      /* Plugin options */
      options: {
        /* Font loading mode */
        mode: "async",

        /* Enable font loading listener to handle FOUT */
        enableListener: true,

        /* Preconnect URL-s. This example is for Google Fonts */
        preconnect: ["https://fonts.gstatic.com"],

        /* Web fonts. File link should point to font CSS file. */
        web: [
          {
            /* Exact name of the font as defied in @font-face CSS rule */
            name: "DM Sans",
            /* URL to the font CSS file with @font-face definition */
            file: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700",
          },
          {
            name: "DM Serif Display",
            file: "https://fonts.googleapis.com/css2?family=DM+Serif+Display",
          },
          {
            name: "Lora",
            file: "https://fonts.googleapis.com/css2?family=Lora",
          },
        ],
      },
    },
  ],
}
