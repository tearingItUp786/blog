import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { useFetcher } from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { H3 } from '../typography'
import { schema, type action } from '~/routes/action.newsletter'
import { useNewsLetterData } from '~/utils/request-info'

export const Newsletter = ({ noBorder }: { noBorder?: boolean }) => {
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

	const isLastResultSuccessful = lastResult?.status === 'success'
	const hasBorder = !noBorder

	return (
		<div
			data-border={hasBorder ? true : undefined}
			className={
				'data-border:border-border-color data-border:border-shine relative mt-24 items-center gap-8 self-end rounded-md bg-transparent py-4 data-border:border-2 data-border:border-solid data-border:px-4 md:py-10 data-border:md:px-12 lg:flex'
			}
		>
			<div className="flex basis-1/2 flex-wrap items-center justify-center md:flex-nowrap">
				<img
					{...newsletterImage}
					loading="lazy"
					alt="Me looking very handsome"
					className="max-w-25 lg:max-w-37.5 dark:grayscale"
				/>
				<H3 className="mb-2 block w-full text-center md:hidden">
					Tear it up with Taran!
				</H3>
				<div className="flex flex-wrap md:pl-7">
					<H3 className="mb-2 hidden md:block">Tear it up with Taran!</H3>
					<p className="text-center text-[15px] leading-5 md:text-left">
						If you're down with my vibe, subscribe to my newsletter for
						inspirational quotes, new things I've learned, and my code snippet
						of the month 🔥
					</p>
				</div>
			</div>
			<div className="basis-1/2">
				{isLastResultSuccessful && (
					<div className="flex flex-wrap justify-center text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width={45}
							height={36}
							fill="none"
						>
							<path
								fill="#262626"
								d="M.436 32.036V12.23c.395-1.903 1.768-3.225 3.742-3.363 3.043-.211 18.42 0 18.42 0 1.096.1 1.194 1.428.164 1.721l-18.953.062-.272.158 15.324 15.33c.643.493 1.342.491 1.984 0l10.242-10.255-.037-.125c-1.696-1.195-2.83-3.133-3.24-5.156l-6.646-.029c-.999-.272-.887-1.594.15-1.705h6.33c.174-6.362 7.091-10.374 12.685-7.128 4.136 2.4 5.452 7.812 2.85 11.859-.94 1.464-2.262 2.485-3.813 3.247l-.012 14.97c-.215 1.947-1.685 3.424-3.655 3.577L4.01 35.389C2.29 35.261.642 33.757.435 32.032l.001.004ZM35.377 2.354c-5.258.54-7.855 6.847-4.457 10.951 2.928 3.536 8.466 3.147 10.883-.736 2.946-4.737-.924-10.779-6.426-10.215ZM2.245 32.207l10.153-10.043-10.11-10.106-.043 20.15Zm35.39-14.895c-1.69.398-3.328.03-4.935-.504l-5.306 5.357 9.981 10.002.173.041c-.04-.11.086-.253.086-.301V17.312ZM36.17 33.585 26.126 23.431c-2.445 1.758-4.677 6.558-8.252 4.125l-4.21-4.125L3.62 33.541l32.549.044Z"
							/>
							<circle className="fill-pink" cx={36.091} cy={9.036} r={8.446} />
						</svg>
						<h3 className="font-display mt-4 mb-2 flex-[1_0_100%] text-xl font-medium">
							Awesome, you're subscribed!
						</h3>
						<p className="max-w-96 text-sm">
							Check your inbox for the confirmation email. What are you waiting
							for? Get to it 😎
						</p>
					</div>
				)}
				{!isLastResultSuccessful && (
					<fetcher.Form
						method="post"
						className="w-full flex-nowrap items-end justify-between gap-4 space-y-4 md:flex md:space-y-0"
						action="/action/newsletter"
						{...getFormProps(form)}
					>
						<HoneypotInputs label="Please leave this field blank" />
						<input
							type="hidden"
							name="convertKitFormId"
							value={ENV.CONVERT_KIT_FORM_ID}
						/>
						<div className={'flex flex-wrap gap-1 self-start'}>
							<label className="w-full" htmlFor={fields.name.id}>
								Name
							</label>
							<input
								{...getInputProps(fields.name, {
									type: 'text',
								})}
								autoComplete="name"
								placeholder="Preferred Name"
								className="w-full rounded-xs p-2 outline outline-black focus:outline-2 dark:bg-transparent dark:outline-white"
							/>
							<div className="text-alert text-sm" id={fields.name.errorId}>
								{fields.name.errors}
							</div>
						</div>
						<div className={'flex flex-wrap gap-1 self-start'}>
							<label className="w-full" htmlFor={fields.email.id}>
								Email
							</label>
							<input
								autoComplete="email"
								data-invalid={form.status === 'error'}
								className="w-full rounded-xs p-2 outline outline-black focus:outline-2 data-[invalid=true]:self-center dark:bg-transparent dark:outline-white"
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
							data-invalid={form.status === 'error'}
							className="mt-4 mb-0 basis-1/4 self-end rounded-sm bg-black px-6 py-2 text-white data-[invalid=true]:mt-0.5 data-[invalid=true]:mb-0 data-[invalid=true]:self-center md:mt-0 md:mb-1.25 dark:bg-white dark:text-black"
						>
							Subscribe
						</button>
					</fetcher.Form>
				)}
			</div>
		</div>
	)
}
