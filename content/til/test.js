const nodePath = require('path')
const fs = require('fs')

let renameFunc = (path) => {
  const fullPath = nodePath.join(__dirname, path)
  const files = fs
    .readdirSync(fullPath)
    .filter((v) => !v.match(/.(png|jpeg|js)/))

  console.log('files', files)

  files.forEach((file) => {
    if (file.endsWith('.mdx')) {
      const fullFilePath = nodePath.join(fullPath, file)
      const content = fs.readFileSync(fullFilePath, 'utf8')
      let date = content
        .match(/[\n\r].*date:\s*([^\n\r]*)/)[0]
        .split('date:')?.[1]
        ?.trim()

      if (date) {
        console.log('file', file)
        console.log(fullFilePath)
        const dateAndFile = `${date}-${file}`

        let replaced = fullFilePath.replace(file, dateAndFile)
        // console.log(replaced)
        fs.renameSync(fullFilePath, replaced, (err) => {
          if (err) throw err
        })

        let p = fullPath.replace(
          file.replace('.mdx', ''),
          dateAndFile.replace('.mdx', '')
        )

        fs.renameSync(fullPath, p, (err) => {
          if (err) throw err
        })
      }
    } else {
      console.log('not mdx')
      renameFunc(nodePath.join(path, file))
    }
  })
}
renameFunc('./')
