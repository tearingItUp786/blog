import { motion } from 'framer-motion'

export const ToastUI = ({ msg }: { msg: string }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.25 }}
			id="toast-simple"
			className="space-x fixed bottom-0 left-0 z-50 flex w-full max-w-xl items-center space-x-4 divide-x divide-gray-700 divide-white rounded-lg bg-gray-100 p-4 text-white shadow-sm dark:divide-gray-200 dark:bg-white dark:text-gray-200"
			role="alert"
		>
			<div
				className="text-primary inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
				role="status"
			>
				<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !p-0 !whitespace-nowrap ![clip:rect(0,0,0,0)]">
					Loading...
				</span>
			</div>
			<div className="truncate pl-4 text-lg font-normal">{msg}</div>
		</motion.div>
	)
}
