import {parseWithZod} from '@conform-to/zod'
import {type ActionFunctionArgs} from '@remix-run/node'
import {z} from 'zod'

export const schema = z.object({
  email: z
    .string({required_error: 'Email is required'})
    .email('Email is invalid'),
  name: z
    .string({required_error: 'Name is required'})
    .max(2, 'Name is too long'),
})

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()

  // Replace `Object.fromEntries()` with the parseWithZod helper
  const submission = parseWithZod(formData, {schema})

  // Report the submission to client if it is not successful
  if (submission.status !== 'success') {
    const x = submission.reply()
    console.log('sumbission reply', x)
    return x
  }

  return submission
}
