const capitalize = require(`remark-capitalize`)
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
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [
          {
            family: `DM Sans`,
            variants: [`400`, `700`],
          },
          {
            family: `DM Serif Display`,
            variants: [`400`],
          },
          {
            family: `Lora`,
            variants: [`400`],
          },
        ],
      },
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
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                })
              })
            },
            query: `
              {
                allMdx(
                  filter: { fileAbsolutePath: { regex: "/^((?!til).)*$/" } },
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Taran's RSS Feed",
            // optional configuration to insert feed reference in pages:
            // if `string` is used, it will be used to create RegExp and then test if pathname of
            // current page satisfied this regular expression;
            // if not provided or `undefined`, all pages will have feed reference inserted
            match: "^/blog/",
          },
        ],
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
          { name: "title", store: true, attributes: { boost: 20 } },
          { name: "excerpt", store: true },
          { name: "content" },
          { name: "type", store: true },
          { name: "url", store: true },
        ],
        // How to resolve each field's value for a supported node type
        resolvers: {
          // For any node of type MarkdownRemark, list how to resolve the fields' values
          Mdx: {
            title: node => node.frontmatter.title,
            excerpt: node => {
              const tree = remark()
                .use(mdx)
                .use(frontmatter, ["yaml"])
                .parse(node.rawBody)
              let excerpt = ""
              visit(tree, "text", an => {
                excerpt += an.value
              })
              const length = 140
              const val = excerpt.slice(0, length) + "..."
              return val
            },
            type: node => (isTIL(node.fields.slug) ? "TIL" : "Blog"),
            content: node => node.rawBody,
            url: node => node.fields.slug,
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
    `gatsby-plugin-well-known`,
  ],
}
