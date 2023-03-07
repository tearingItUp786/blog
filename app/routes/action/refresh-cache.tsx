import {ActionFunction, json, redirect} from '@remix-run/node'

type Body = {contentFiles: Array<string>}

export const action: ActionFunction = async ({request}) => {
  if (request.headers.get('auth') !== process.env.REFRESH_CACHE_SECRET) {
    return redirect('https://youtu.be/VM3uXu1Dq4c')
  }

  const body = (await request.json()) as Body

  if (!body.contentFiles) {
    return json({ok: false})
  }
  console.log('we got something buddy', body)

  return json({ok: true})
}
