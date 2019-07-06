const path = require(`path`)

// extract out the function that's run to create pages into a help method
// it'll run the callback (create pages) a specified number of times
function generatePages({
  length,
  basePath,
  postsPerPage,
  componentPath,
  callback,
}) {
  Array.from({ length }).forEach((_, i) => {
    callback({
      path: i === 0 ? `/${basePath}` : `/${basePath}/${i + 1}`,
      component: path.resolve(componentPath),
      context: {
        basePath,
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages: length,
        currentPage: i + 1,
      },
    })
  })
}

exports.generatePages = generatePages
