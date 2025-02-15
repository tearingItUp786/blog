const {getChangedFiles} = require('./get-changed-files.cjs')
const isProd = process.env.NODE_ENV === 'production'
const hostname = isProd ? 'taranveerbains.ca' : 'localhost'
const port = isProd ? 443 : 8080
const protocol = isProd ? 'https' : 'http'
const httpModule = isProd ? require('https') : require('http')

async function checkAlive() {
  return new Promise((resolve, reject) => {
    const req = httpModule
      .request(`${protocol}://${hostname}`, res => {
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => resolve(data))
        res.on('error', reject)
      })
      .on('error', reject)

    req.end()
  }).catch(error => {
    console.error(`Error checking server life: ${error.message}`)
    throw error
  })
}

function postRefreshCache({
  postData,
  options: {headers: headersOverrides = {}, ...optionsOverrides} = {},
}) {
  return new Promise((resolve, reject) => {
    const postDataString = JSON.stringify(postData)

    const options = {
      hostname,
      port,
      path: '/action/refresh-cache',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postDataString),
        auth: process.env.REFRESH_CACHE_SECRET || 'some_secret',
        'x-force-fresh': process.env.FORCE_FRESH || '',
        ...headersOverrides,
      },
      ...optionsOverrides,
    }

    const req = httpModule.request(options, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => {
        try {
          const responseJson = JSON.parse(data)
          if (responseJson.ok) {
            console.log('Server acknowledged cache refresh.')
            resolve(responseJson)
          } else {
            console.error('Unexpected server response:', responseJson)
            reject(new Error('Server did not acknowledge with "okay".'))
          }
        } catch (e) {
          console.error(`Error parsing response: ${data}`)
          reject(new Error('Invalid JSON response from server.'))
        }
      })
    })

    req.on('error', e => {
      console.error(`Request error: ${e.message}`)
      reject(e)
    })

    req.write(postDataString)
    req.end()
  })
}

async function go() {
  try {
    if (isProd) await checkAlive()

    const changes = await getChangedFiles('HEAD^', 'HEAD')
    const contentFiles = changes.filter(change =>
      change.filename.startsWith('content'),
    )

    if (!contentFiles.length && !process.env.FORCE_FRESH) {
      console.log('No content changes detected.')
      return
    }

    console.log('Content changes detected, refreshing cache.')
    await postRefreshCache({postData: {contentFiles}})

    console.log('Cache refresh confirmed, exiting.')
  } catch (error) {
    console.error('An error occurred:', error)
    process.exit(1)
  }
}

go()
