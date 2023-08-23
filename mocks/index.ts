import {graphql} from 'msw'
import {setupServer} from 'msw/node'
import path from 'path'
import fs from 'fs'

const github = graphql.link('https://api.github.com/graphql')

const server = setupServer(
  // NOT "/user", nothing to be relative to!
  github.query('downloadDir', (req, res, ctx) => {
    const {slug} = req.body?.variables
    // this takes the shape of main:content/blog/some-blog-title
    // or main:content/til
    // or main:content/blog
    const [, directory, subDirectory] = slug.split('/')

    // this is the scenario where we are getting
    // just the single blog post so we can fetch just the one object
    if (subDirectory) {
      const object = getGqlObject(directory, subDirectory)
      return res(
        ctx.data({
          repository: {
            object: {...object?.object} ?? null,
          },
        }),
      )
    }

    // this is if it's just one directory like something like blog or til
    const object = getContentDir(directory)
    return res(
      ctx.data({
        repository: {
          object: object
            ? {
                entries: object,
              }
            : null,
        },
      }),
    )
  }),
)

// recursively construct entries which is an array of objects
type Gobj = {
  name?: string
  type?: 'text' | 'blob'
  text?: string
  entries?: Gobj[]
  object?: Gobj
}

// this is something like /blog or /til
function getContentDir(directory: string) {
  const contentPath = path.resolve(__dirname, `../content/${directory}/`)

  if (!fs.existsSync(contentPath)) {
    return null
  }

  // get all the subdirectories
  const dirs = fs.readdirSync(contentPath, 'utf8')

  const entries: Gobj[] = []
  for (let subDirectory of dirs) {
    const innerEntries = getGqlObject(directory, subDirectory)
    if (innerEntries) {
      entries.push(innerEntries)
    }
  }

  return entries
}

// the meat of this resolver -- it will return the correct shape
// of the gql object if it is a directory or not
function getGqlObject(directory: string, subDirectory: string) {
  const contentPath = path.resolve(
    __dirname,
    `../content/${directory}/${subDirectory}/`,
  )

  if (!fs.existsSync(contentPath)) {
    return null
  }

  const isDir = fs.lstatSync(contentPath).isDirectory()

  // if the path is a directory, we need to traverse down a level
  if (isDir) {
    const dir = fs.readdirSync(contentPath, 'utf8')
    const contents = dir.map(file => {
      const textFilePath = path.resolve(contentPath, file)
      const object = {
        text: fs.readFileSync(textFilePath, 'utf8'),
      }
      return {
        name: file,
        type: 'blob',
        object,
      } as Gobj
    })

    return {
      name: subDirectory,
      object: {
        entries: contents,
      },
    } as Gobj
  }

  return {
    name: subDirectory,
    type: 'blob',
    object: {
      text: fs.readFileSync(contentPath, 'utf8'),
    },
  } as Gobj
}

server.listen({onUnhandledRequest: 'warn'})
console.info('🔶 Mock server installed')

process.once('SIGINT', () => server.close())
process.once('SIGTERM', () => server.close())
