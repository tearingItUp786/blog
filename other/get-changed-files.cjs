// try to keep this dep-free so we don't have to install deps
const execSync = require('child_process').execSync

const changeTypes = {
  M: 'modified',
  A: 'added',
  D: 'deleted',
  R: 'moved',
}

async function getChangedFiles(currentCommitSha, compareCommitSha) {
  try {
    const gitOutput = execSync(
      `git diff --name-status ${currentCommitSha} ${compareCommitSha}`,
    ).toString()
    return parseGitDiff(gitOutput)
  } catch (error) {
    console.error(`Something went wrong trying to get changed files.`, error)
    return null
  }
}

function parseGitDiff(gitOutput) {
  const changes = []
  for (const line of gitOutput.split('\n').filter(Boolean)) {
    const [status, ...filenames] = line.split('\t')
    const change = status?.[0]
    const changeType = changeTypes[change]
    if (!changeType) {
      console.error(`Unknown change type: ${status} ${filenames.join(' ')}`)
      continue
    }
    for (const filename of change === 'R' ? filenames : filenames.slice(0, 1)) {
      if (filename) changes.push({changeType, filename})
    }
  }
  return changes
}

module.exports = {getChangedFiles, parseGitDiff}
