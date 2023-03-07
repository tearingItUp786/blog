import {ActionFunction, redirect} from '@remix-run/node'

export const action: ActionFunction = async ({request}) => {
  if (request.headers.get('auth') !== process.env.REFRESH_CACHE_SECRET) {
    return redirect('https://youtu.be/VM3uXu1Dq4c')
  }

  console.log('we got something buddy', request.body)
}
