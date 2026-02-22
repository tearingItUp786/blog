export default function Popover() {
	return (
		<>
			<button
				// @ts-ignore
				popovertarget="my-popover"
				className="w-fit rounded bg-black px-4 py-2 font-bold text-white transition-all outline-dashed hover:bg-white hover:text-black hover:outline-1"
			>
				Click me
			</button>

			<div
				// @ts-ignore
				popover="auto"
				className="dark:bg-charcoal-gray h-3/4 w-3/4 items-center justify-center rounded border border-solid border-black bg-white dark:border-white"
				id="my-popover"
			>
				<div className="flex h-[90%] flex-wrap items-center justify-center">
					<div>
						<h3>Hit the `esc` key to close me or click outside.</h3>
					</div>
				</div>
			</div>
		</>
	)
}
