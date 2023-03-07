const {getChangedFiles} = require('./get-changed-files')

async function go() {
  console.log('get changed files')
  const changes = await getChangedFiles('HEAD^', 'HEAD')
  console.log(changes)
  return changes
}

go()
