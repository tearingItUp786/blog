import { motion } from 'framer-motion'
import { useFetcher } from 'react-router'
import { twJoin } from 'tailwind-merge'
import { useTheme as useThemeHook } from '~/routes/action.theme-switcher'

export const ServerThemeToggle = () => {
	const mode = useThemeHook()
	const fetcher = useFetcher()
	const nextTheme = mode === 'dark' ? 'light' : 'dark'
	const isDark = mode === 'dark'

	return (
		<fetcher.Form
			preventScrollReset
			method="POST"
			action="/action/theme-switcher"
		>
			<div
				className={twJoin(
					'z-100',
					'bg-accent flex h-8 w-18 cursor-pointer items-center rounded-full p-2 transition-colors',
				)}
				onClick={async (evt) => {
					await fetcher.submit(evt.currentTarget.closest('form')!)
				}}
			>
				<input type="hidden" name="theme" value={nextTheme} />
				<motion.div
					animate={{ x: isDark ? '135%' : '0%' }}
					transition={{ type: 'spring', stiffness: 300, damping: 22 }}
					className={twJoin(
						'drop-shadow-toggle h-6 w-6 cursor-pointer appearance-none rounded-full ring-1 ring-black/10 dark:ring-black/15',
						'bg-dark-gray-100',
						'dark:bg-white',
					)}
					role="switch"
					aria-checked={isDark}
					aria-label="Toggle theme mode"
				/>
			</div>
		</fetcher.Form>
	)
}
