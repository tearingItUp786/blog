const path = require(`path`)
const nodeHelpers = require("./src/utils/node/helpers")
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = ({ graphql, actions, ...rest }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const tagList = path.resolve("./src/templates/tag-list.js")

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
        tags: allMdx {
          group(field: frontmatter___tag) {
            fieldValue
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

    // creates a number of pages for blogs posts using a helper
    nodeHelpers.generatePages({
      length: blogNumPages,
      basePath: "blog",
      postsPerPage,
      callback: createPage,
      componentPath: "./src/templates/blog-list.js",
    })

    const tagsList = result.data.tags.group
    tagsList.forEach((tag, index) => {
      createPage({
        path: `/tags/${tag.fieldValue}`,
        component: tagList,
        context: {
          tag: tag.fieldValue,
          tagQuery: `/${tag.fieldValue}/i`,
        },
      })
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
