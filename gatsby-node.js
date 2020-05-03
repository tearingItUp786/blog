const path = require(`path`)
const nodeHelpers = require("./src/utils/node/helpers")
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = ({ graphql, actions, ...rest }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  return graphql(
    `
      {
        blog: allMdx(
          filter: { fileAbsolutePath: { regex: "/^((?!til).)*$/" } }
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
        til: allMdx(
          filter: { fileAbsolutePath: { regex: "/(?=til).*$/" } }
          sort: { fields: [frontmatter___date], order: DESC }
        ) {
          edges {
            node {
              excerpt
              fields {
                slug
              }
              body
              frontmatter {
                date(formatString: "MMMM DD, YYYY")
                title
                tag
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }
    // Create blog posts pages.
    const blogPosts = result.data.blog.edges
    const tilPosts = result.data.til.edges

    blogPosts.forEach((post, index) => {
      const previous =
        index === blogPosts.length - 1 ? null : blogPosts[index + 1].node
      const next = index === 0 ? null : blogPosts[index - 1].node
      createPage({
        path: post.node.fields.slug,
        component: blogPost,
        context: {
          slug: post.node.fields.slug,
          previous,
          next,
        },
      })
    })

    // Create blog-list pages that'll be from both blogPosts and tilPosts
    const postsPerPage = 5
    const blogNumPages = Math.ceil(blogPosts.length / postsPerPage)
    const tilNumPages = Math.ceil(tilPosts.length / postsPerPage)

    // creates a number of pages for blogs posts using a helper
    nodeHelpers.generatePages({
      length: blogNumPages,
      basePath: "blog",
      postsPerPage,
      callback: createPage,
      componentPath: "./src/templates/blog-list.js",
    })

    // creates a number of pages for til list
    nodeHelpers.generatePages({
      length: tilNumPages,
      basePath: "til",
      postsPerPage,
      callback: createPage,
      componentPath: "./src/templates/til-list.js",
    })
    return null
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    const parent = getNode(node.parent)

    if (parent.dir.match(/^((?!til).)*$/)) {
      const value = createFilePath({ node, getNode })
      createNodeField({
        name: `slug`,
        node,
        value: `/blog${value}`,
      })
    }

    if (parent.dir.match(/(?=til).*$/)) {
      createNodeField({
        name: `slug`,
        node,
        value: `${node.frontmatter.title
          .replace(/[^\w]/gi, "-")
          .toLocaleLowerCase()}`,
      })
    }
  }
}

// Required to get gatsby to work with tailwind
exports.onCreateWebpackConfig = ({ actions, getConfig }) => {
  const config = getConfig()
  config.node = {
    fs: "empty",
  }
  actions.replaceWebpackConfig(config)
}
