import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { twMerge } from 'tailwind-merge'
import { H3 } from '../typography'
import { schema, type action } from '~/routes/action.newsletter'
import { useNewsLetterData } from '~/utils/request-info'
import './newsletter.css'

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

	return (
		<div
			className={
				twMerge(
					'relative mt-24 items-center gap-8 self-end rounded-md bg-transparent py-4 md:py-10 lg:flex',
					noBorder
						? ''
						: 'border-[1.5px] border-solid border-border-color px-4 md:px-12',
				) + (noBorder ? '' : ' border-shine')
			}
		>
			<div className="flex basis-1/2 flex-wrap items-center justify-center md:flex-nowrap">
				<img
					{...newsletterImage}
					loading="lazy"
					alt="Me looking very handsome"
					className="max-w-[100px] dark:grayscale lg:max-w-[150px]"
				/>
				<H3 className="mb-2 block w-full text-center md:hidden">
					Tear it up with Taran!
				</H3>
				<div className="flex flex-wrap md:pl-7">
					<H3 className="mb-2 hidden md:block">Tear it up with Taran!</H3>
					<p className="text-center text-[15px] leading-[20px] md:text-left">
						If you're down with my vibe, subscribe to my newsletter for
						inspirational quotes, new things I've learned, and my code snippet
						of the month 🔥
					</p>
				</div>
			</div>
			<div className="basis-1/2">
				{form?.errors?.length ? (
					<div className="flex flex-wrap gap-2">
						{form.errors.map((error, index) => (
							<p className="mb-2 text-sm text-alert" key={index}>
								{error}
							</p>
						))}
					</div>
				) : null}
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
						<h3 className="mb-2 mt-4 flex-[1_0_100%] font-display text-xl font-medium">
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
							<div className="text-sm text-alert" id={fields.name.errorId}>
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
							<div className="text-sm text-alert" id={fields.email.errorId}>
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
				)}
			</div>
		</div>
	)
}
