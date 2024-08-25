// I want to read the redirects.txt file and do the redirecting
// I want to do this in a way that is async and doesn't block the server

// TODO: this is a stub
let METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

let isComment = line => line.startsWith('#')
let isCommentOrEmpty = line => isComment(line) || line.trim() === ''
let notCommentOrEmpty = line => !isCommentOrEmpty(line)

/**
 *
 * @param {string} line
 * @returns {{method: string|string[], from: string, to: string}} An object representing the parsed line with method, from, and to properties.
 */
let parseLine = line => {
  let [method, from, to] = line.split(' ').filter(notCommentOrEmpty)

  // this means we have multiple methods
  if (method.includes(',')) {
    method = method.split(',').map(m => m.trim().toUpperCase())
  }

  if (Array.isArray(method)) {
    method = method.map(m =>
      METHODS.includes(m.toUpperCase()) ? m.toUpperCase() : 'GET',
    )
    return {method, from, to}
  }

  if (!METHODS.includes(method)) {
    let oldMethod = method
    method = '*'
    to = from
    from = oldMethod
  }

  return {method, from, to}
}

function redirectMiddlware(redirectsString) {
  let redirects = redirectsString
    .split('\n')
    .filter(notCommentOrEmpty)
    .map(parseLine)

  return (req, res, next) => {
    let requestedUrl = req.originalUrl
    let redirect = redirects.find(r => {
      let regex = new RegExp(r.from)
      if (regex.test(requestedUrl)) {
        return true
      }
    })

    if (redirect) {
      const newUrl = requestedUrl.replace(
        new RegExp(redirect.from),
        redirect.to,
      )

      // Handle redirection based on the request method
      if (
        (Array.isArray(redirect.method) &&
          redirect.method.includes(req.method)) ||
        redirect.method === '*'
      ) {
        return res.redirect(newUrl)
      }
    }

    next()
  }
}

export {redirectMiddlware}
