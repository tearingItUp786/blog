import {parseWithZod} from '@conform-to/zod'
import {type ActionFunctionArgs} from '@remix-run/node'
import {z} from 'zod'

export const schema = z.object({
  email: z
    .string({required_error: 'Email is required'})
    .email('Email is invalid'),
  name: z
    .string({required_error: 'Name is required'})
    .max(250, 'Name is too long'),
})

export const action = async ({request}: ActionFunctionArgs) => {
  // return new Response('Error', {status: 500})
  const formData = await request.formData()

  // Replace `Object.fromEntries()` with the parseWithZod helper
  const submission = parseWithZod(formData, {schema})

  // Report the submission to client if it is not successful
  if (submission.status !== 'success') {
    return submission.reply()
  }

  // submit a request to convertkit
  let params = {
    api_key: process.env.CONVERT_KIT_API_KEY,
  }
  let queryString = new URLSearchParams(params).toString()
  let response = await fetch(
    `${process.env.CONVERT_KIT_API}/forms/${process.env.CONVERT_KIT_FORM_ID}/subscribe?${queryString}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: submission.value.email,
        name: submission.value.name,
      }),
    },
  )

  if (response.status !== 200) {
    return submission.reply({
      formErrors: ['Failed to subscribe. Please try again later.'],
    })
  }

  return submission
}
