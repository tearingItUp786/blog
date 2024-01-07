async function run() {
  if (process.env.NODE_ENV === 'production') {
    await import('../index.mjs')
  } else {
    const {execa} = await import('execa')
    // const command =
    //   'tsx watch --clear-screen=false --ignore "app/**" --ignore "build/**" --ignore "node_modules/**" --inspect ./index.mjs'
    const command =
      'tsx watch --clear-screen=false  --inspect ./server/index.mjs'
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
