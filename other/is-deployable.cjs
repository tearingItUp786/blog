// try to keep this dep-free so we don't have to install deps
const { getChangedFiles } = require('./get-changed-files.cjs')

async function go() {
  console.log(false)
  return;
  const changedFiles = await getChangedFiles('HEAD^', 'HEAD')
  console.error('Determining whether the changed files are deployable', {
    changedFiles,
  })
  // deploy if:
  // - there was an error getting the changed files (null)
  // - there are no changed files
  // - there are changed files, but at least one of them is non-content
  const isDeployable =
    changedFiles === null ||
    changedFiles.length === 0 ||
    changedFiles.some(({ filename }) => !filename.startsWith('content'))

  console.error(
    isDeployable
      ? '🟢 There are deployable changes'
      : '🔴 No deployable changes',
    { isDeployable },
  )
  console.log(isDeployable)
}

go().catch(e => {
  console.error(e)
  console.log('true')
})
