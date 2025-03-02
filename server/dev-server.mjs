async function run() {
  if (process.env.NODE_ENV === 'production') {
    await import('../index.mjs')
  } else {
    /**
     * So this handy little thing here is basically to compile the mocks into a format
     * that can be handled by our index.mjs files.
     *
     * It's a bit of a hack, but it works.
     */
    console.log('👀 Starting dev server')
    const { execa } = await import('execa')

    const compileComand = `esbuild index.ts --outfile=index.cjs --bundle  --platform=node  --format=cjs --target=es2020`

    console.log('🔨 Compiling mock files')
    await execa(compileComand, {
      stdio: ['ignore', 'inherit', 'inherit'],
      cwd: 'mocks',
      shell: true,
      env: {
        FORCE_COLOR: true,
        MOCKS: true,
        ...process.env,
      },
      // https://github.com/sindresorhus/execa/issues/433
      windowsHide: false,
    })

    // this command just watches for changes and restarts the server
    // const command =
    //   'tsx watch --clear-screen=false --ignore "vite**" --ignore "app/**" --ignore "build/**" --ignore "node_modules/**" --inspect ./index.mjs'
    const command =
      'nodemon --ignore "vite**" --ignore "app/**" --ignore "build/**" --ignore "node_modules/**" --inspect ./index.mjs'

    execa(command, {
      stdio: ['ignore', 'inherit', 'inherit'],
      shell: true,
      env: {
        FORCE_COLOR: true,
        MOCKS: true,
        ...process.env,
      },
      // https://github.com/sindresorhus/execa/issues/433
      windowsHide: false,
    })
  }
}

run()
