import { motion, useReducedMotion } from 'framer-motion'
import { useFetcher } from 'react-router'
import { twJoin } from 'tailwind-merge'
import { useTheme as useThemeHook } from '~/routes/action.theme-switcher'

export const ServerThemeToggle = () => {
	const mode = useThemeHook()
	const fetcher = useFetcher()
	const nextTheme = mode === 'dark' ? 'light' : 'dark'
	const isDark = mode === 'dark'
	const prefersReducedMotion = useReducedMotion()

	return (
		<fetcher.Form
			preventScrollReset
			method="POST"
			action="/action/theme-switcher"
		>
			<input type="hidden" name="theme" value={nextTheme} />
			<button
				type="submit"
				role="switch"
				aria-checked={isDark}
				aria-label={`Switch to ${nextTheme} mode`}
				className={twJoin(
					'z-100',
					'bg-accent flex h-8 w-18 cursor-pointer items-center rounded-full border-none p-2 transition-colors',
					'focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2',
				)}
			>
				<motion.div
					animate={{ x: isDark ? '135%' : '0%' }}
					transition={
						prefersReducedMotion
							? { duration: 0 }
							: { type: 'spring', stiffness: 300, damping: 22 }
					}
					className={twJoin(
						'drop-shadow-toggle pointer-events-none h-6 w-6 rounded-full ring-1 ring-black/10 dark:ring-black/15',
						'bg-dark-gray-100',
						'dark:bg-white',
					)}
					aria-hidden="true"
				/>
			</button>
		</fetcher.Form>
	)
}
