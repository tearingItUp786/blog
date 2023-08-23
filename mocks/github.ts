import path from 'path'
import fs from 'fs'
import type {GithubGraphqlObject} from 'types'
import {graphql} from 'msw'

const github = graphql.link('https://api.github.com/graphql')

type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object | undefined ? RecursivePartial<T[P]> :
    T[P];
};

type AllOptional = RecursivePartial<GithubGraphqlObject>

function createBlobObject(name: string, filePath: string): AllOptional {
  return {
    name,
    type: 'blob',
    object: {
      text: fs.readFileSync(filePath, 'utf8'),
    },
  }
}

function createDirectoryObject(
  contentPath: string,
  subDirectory: string,
): AllOptional {
  const dir = fs.readdirSync(contentPath, 'utf8')
  const entries: AllOptional[] = []

  for (const file of dir) {
    const filePath = path.resolve(contentPath, file)
    if (fs.lstatSync(filePath).isDirectory()) {
      const innerEntries = createDirectoryObject(filePath, file)
      entries.push({
        name: file,
        object: {
          entries: innerEntries?.object?.entries,
        },
      })
    } else {
      entries.push(createBlobObject(file, filePath))
    }
  }

  return {
    name: subDirectory,
    object: {
      name: subDirectory,
      entries,
    },
  }
}

function getObjectForHandler(directory: string, subDirectory?: string) {
  const contentPath = path.resolve(__dirname, `../content/${directory}/`)

  if (!fs.existsSync(contentPath)) {
    return {
      object: null,
    }
  }

  // this is the scenario where we have something like content:main/blog/someblog
  if (subDirectory) {
    return {
      object: createDirectoryObject(
        path.join(contentPath, subDirectory),
        subDirectory,
      ).object,
    }
  }

  const {entries} = createDirectoryObject(contentPath, directory)?.object ?? {}

  return {
    object: entries ? {entries} : null,
  }
}

const githubHandlers = [
  github.query('downloadDir', (req, res, ctx) => {
    const {slug} = req.body?.variables
    const [, directory, subDirectory] = slug.split('/')
    const {object} = getObjectForHandler(directory, subDirectory)

    return res(
      ctx.data({
        repository: {
          object,
        },
      }),
    )
  }),
]

export {githubHandlers}
