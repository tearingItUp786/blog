import {getFormProps, getInputProps, useForm} from '@conform-to/react'
import {useNewsletterImage} from '~/utils/request-info'
import {H3} from '../typography'
import {useFetcher} from '@remix-run/react'
import {schema, type action} from '~/routes/action.newsletter'
import {getZodConstraint, parseWithZod} from '@conform-to/zod'
import {twMerge} from 'tailwind-merge'

export const Newsletter = () => {
  const desktopImage = useNewsletterImage()
  const fetcher = useFetcher<ReturnType<typeof action>>({key: 'newsletter'})
  const lastResult = fetcher.data
  const [form, fields] = useForm({
    id: 'form-newsletter',
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({formData}) {
      return parseWithZod(formData, {schema})
    },
  })

  return (
    <div className="my-24 items-center gap-8 rounded-md border-[1.5px] border-solid border-border-color bg-transparent px-12 py-10 lg:flex">
      <div className="flex basis-1/2 items-center">
        <img
          alt="Me looking very handsome"
          className="max-w-[100px] dark:grayscale lg:max-w-[150px]"
          src={desktopImage}
        />
        <div className="flex flex-wrap pl-7">
          <H3 className="mb-2">Tear it up with Taran!</H3>
          <p className="text-[15px] leading-[20px]">
            If you’re down with my vibe, subscribe to my newsletter for
            inspirational quotes, new things I’ve learned, and my code snippet
            of the month 🔥
          </p>
        </div>
      </div>
      <div className="basis-1/2 ">
        <fetcher.Form
          method="post"
          className="w-full flex-nowrap items-end justify-between gap-4 md:flex"
          action="/action/newsletter"
          {...getFormProps(form)}
        >
          <div className={'flex flex-wrap self-start'}>
            <label className="w-full" htmlFor={fields.name.id}>
              Name
            </label>
            <input
              {...getInputProps(fields.name, {
                type: 'text',
              })}
              placeholder="Preferred Name"
              className={twMerge(
                'w-full rounded-md border-[1px] border-black p-2 dark:border-white dark:bg-transparent',
              )}
            />
            <div className="" id={fields.name.errorId}>
              {fields.name.errors}
            </div>
          </div>
          <div className={'mt-6 basis-2/3 self-start md:mt-0'}>
            <label className="w-full" htmlFor={fields.email.id}>
              Email
            </label>
            <input
              className={twMerge(
                'w-full rounded-md border-[1px] border-black p-2 dark:border-white dark:bg-transparent',
                (fields.name.errors || fields.email.errors) && 'self-center',
              )}
              placeholder="Email Address"
              {...getInputProps(fields.email, {
                type: 'email',
              })}
            />
            <div className="" id={fields.email.errorId}>
              {fields.email.errors}
            </div>
          </div>
          <button
            className={twMerge(
              'mt-6 basis-1/4 self-end rounded bg-black px-6 py-2 text-white dark:bg-white dark:text-black md:mt-0',
              (fields.name.errors || fields.email.errors) && 'self-center',
            )}
          >
            Subscribe
          </button>
        </fetcher.Form>
      </div>
    </div>
  )
}
