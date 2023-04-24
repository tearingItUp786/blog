const {getChangedFiles} = require('./get-changed-files')
const isProd = process.env.NODE_ENV === 'production'
const hostname = isProd ? 'taranveerbains.ca' : 'localhost'
const httpModule = isProd ? require('https') : require('http')

function checkAlive() {
  return new Promise((resolve, reject) => {
    try {
      // make http request to localhost:8080
      const req = httpModule
        .request(`${isProd ? 'https' : 'http'}://${hostname}`, res => {
          let data = ''
          res.on('data', d => {
            data += d
          })

          res.on('end', () => {
            try {
              resolve('done')
            } catch (error) {
              reject(data)
            }
          })
        })
        .on('error', wtf => {
          console.log('wtf', wtf)
          reject(wtf)
        })
      req.write('done')
      req.end()
    } catch (error) {
      console.log('oh no', error)
      reject(error)
    }
  })
}

// try to keep this dep-free so we don't have to install deps
function postRefreshCache({
  postData,
  options: {headers: headersOverrides, ...optionsOverrides} = {},
}) {
  return new Promise((resolve, reject) => {
    try {
      const postDataString = JSON.stringify(postData)

      const options = {
        hostname,
        path: `/action/refresh-cache`,
        method: 'POST',
        port: isProd ? 443 : 8080,
        headers: {
          auth: process.env.REFRESH_CACHE_SECRET || 'some_secret',
          'x-force-fresh': process.env.FORCE_FRESH,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postDataString),
          ...headersOverrides,
        },
        ...optionsOverrides,
      }

      const req = httpModule
        .request(options, res => {
          let data = ''
          res.on('data', d => {
            data += d
          })

          res.on('end', () => {
            try {
              console.log('data', data)
              resolve(JSON.parse(data))
            } catch (error) {
              console.log('wtf', data)
              reject(data)
            }
          })
        })
        .on('error', wtf => {
          console.log('wtf', wtf)
          reject(wtf)
        })
      req.write(postDataString)
      req.end()
    } catch (error) {
      console.log('oh no', error)
      reject(error)
    }
  })
}

async function go() {
  // we need to make sure the server is alive before we even try to invalidate the cache
  try {
    console.log('🏥 checking for life')
    isProd && (await checkAlive())
    const forceFresh = process.env.FORCE_FRESH
    const changes = await getChangedFiles('HEAD^', 'HEAD')

    // with the changes, we can determine if we need to refresh the cache
    // if there's nothing in the cache from content, we don't need to refresh the cache
    // or update algolia
    console.log('👀 checking for content changes')
    let contentFiles = changes.filter(o => o.filename.indexOf('content') === 0)
    if (!contentFiles.length || !forceFresh) {
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
  } catch (error) {
    console.log(error)
    console.log('🤯 error')
  }
}

go()
