import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { twMerge } from 'tailwind-merge'
import { H3 } from '../typography'
import { schema, type action } from '~/routes/action.newsletter'
import { useNewsLetterData } from '~/utils/request-info'

export const Newsletter = () => {
	const { newsletterImage, showNewsLetter } = useNewsLetterData()
	const fetcher = useFetcher<ReturnType<typeof action>>({ key: 'newsletter' })
	const lastResult: any = fetcher.data

	const [form, fields] = useForm({
		id: 'form-newsletter',
		lastResult,
		constraint: getZodConstraint(schema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
	})

	if (!showNewsLetter) {
		return null
	}

	return (
		<div className="border-border-color my-24 items-center gap-8 rounded-md border-[1.5px] border-solid bg-transparent px-4 py-4 md:px-12 md:py-10 lg:flex">
			<div className="flex basis-1/2 flex-wrap items-center justify-center md:flex-nowrap">
				<img
					alt="Me looking very handsome"
					className="max-w-[100px] lg:max-w-[150px] dark:grayscale"
					src={newsletterImage}
				/>
				<H3 className="mb-2 block w-full text-center md:hidden">
					Tear it up with Taran!
				</H3>
				<div className="flex flex-wrap md:pl-7">
					<H3 className="mb-2 hidden md:block">Tear it up with Taran!</H3>
					<p className="text-center text-[15px] leading-[20px] md:text-left">
						If you’re down with my vibe, subscribe to my newsletter for
						inspirational quotes, new things I’ve learned, and my code snippet
						of the month 🔥
					</p>
				</div>
			</div>
			<div className="basis-1/2">
				{form?.errors?.length ? (
					<div className="flex flex-wrap gap-2">
						{form.errors.map((error, index) => (
							<p className="text-alert mb-2 text-sm" key={index}>
								{error}
							</p>
						))}
					</div>
				) : null}
				{lastResult?.status === 'success' && (
					<h4
						className="text-alert mb-8 flex items-start bg-transparent"
						role="alert"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="h-auto w-10"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
							/>
						</svg>
						<span className="ml-1">
							Success: Go check your inbox for the confirmation email 😎. Well,
							what are you waiting for?
							<strong className="text-xl"> Get to it!</strong>
						</span>{' '}
					</h4>
				)}
				{lastResult?.status !== 'success' && (
					<fetcher.Form
						method="post"
						className="w-full flex-nowrap items-end justify-between gap-4 md:flex"
						action="/action/newsletter"
						{...getFormProps(form)}
					>
						<HoneypotInputs label="Please leave this field blank" />
						<input
							type="hidden"
							name="convertKitFormId"
							value={ENV.CONVERT_KIT_FORM_ID}
						/>
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
							<div className="text-alert text-sm" id={fields.name.errorId}>
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
							<div className="text-alert text-sm" id={fields.email.errorId}>
								{fields.email.errors}
							</div>
						</div>
						<button
							className={twMerge(
								'mt-6 basis-1/4 self-end rounded-sm bg-black px-6 py-2 text-white md:mt-0 dark:bg-white dark:text-black',
								(fields.name.errors || fields.email.errors) && 'self-center',
							)}
						>
							Subscribe
						</button>
					</fetcher.Form>
				)}
			</div>
		</div>
	)
}
