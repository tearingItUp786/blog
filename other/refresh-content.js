const {getChangedFiles} = require('./get-changed-files')
const hostname = 'localhost'

// try to keep this dep-free so we don't have to install deps
function postRefreshCache({
  http = require('http'),
  postData,
  options: {headers: headersOverrides, ...optionsOverrides} = {},
}) {
  return new Promise((resolve, reject) => {
    try {
      const postDataString = JSON.stringify(postData)

      const options = {
        hostname,
        port: 3000,
        path: `/action/refresh-cache`,
        method: 'POST',
        headers: {
          auth: process.env.REFRESH_CACHE_SECRET || 'some_secret',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postDataString),
          ...headersOverrides,
        },
        ...optionsOverrides,
      }

      const req = http
        .request(options, res => {
          let data = ''
          res.on('data', d => {
            data += d
          })

          res.on('end', () => {
            try {
              resolve(JSON.parse(data))
            } catch (error) {
              reject(data)
            }
          })
        })
        .on('error', reject)
      req.write(postDataString)
      req.end()
    } catch (error) {
      console.log('oh no', error)
      reject(error)
    }
  })
}

async function go() {
  const changes = await getChangedFiles('HEAD^', 'HEAD')
  // with the changes, we can determine if we need to refresh the cache
  // if there's nothing in the cache from content, we don't need to refresh the cache
  // or update algolia

  console.log('👀 checking for content changes')
  let contentFiles = changes.filter(o => o.filename.indexOf('content') === 0)
  if (!contentFiles.length) {
    console.log('🤷 no content changes, exiting')
    return
  }

  console.log('👍 content changes, refreshing cache and updating algolia')
  // call the refresh cache function with the content files
  await postRefreshCache({
    postData: {
      contentFiles,
    },
  })
  return changes
}

go()
