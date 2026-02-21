import clsx from 'clsx'
import { useFetcher } from 'react-router'
import { twJoin } from 'tailwind-merge'
import { useTheme as useThemeHook } from '~/routes/action.theme-switcher'

export const ServerThemeToggle = () => {
	const mode = useThemeHook()
	const fetcher = useFetcher()
	const nextTheme = mode === 'dark' ? 'light' : 'dark'

	return (
		<fetcher.Form
			preventScrollReset
			method="POST"
			action="/action/theme-switcher"
		>
			<div
				className={clsx(
					'z-100',
					'bg-accent flex h-8 w-18 cursor-pointer items-center rounded-full p-2 transition-colors',
				)}
				onClick={async (evt) => {
					await fetcher.submit(evt.currentTarget.closest('form')!)
				}}
			>
				<input type="hidden" name="theme" value={nextTheme} />
				<input
					id="website-theme-toggle"
					aria-label="Toggle theme mode"
					className={twJoin(
						'transition-color drop-shadow-toggle h-6 w-6 cursor-pointer appearance-none rounded-full ring-1 ring-black/10 transition-transform ease-in-out dark:ring-black/15',
						'translate-x-0 bg-gray-100',
						'dark:translate-x-[135%] dark:bg-white',
					)}
					type="checkbox"
					role="switch"
				/>
			</div>
		</fetcher.Form>
	)
}
