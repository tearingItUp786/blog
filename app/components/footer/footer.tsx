import { NavLink, useSearchParams } from 'react-router'

export function Footer() {
	const [searchParams] = useSearchParams()
	const searchParamsWithoutOffset = new URLSearchParams(searchParams)
	// we don't need the offset for the navbar
	searchParamsWithoutOffset.delete('offset')

	return (
		<footer className="border-body w-full border-t-[1px] px-4 py-6">
			<div className="mx-auto block w-full max-w-screen-xl justify-between text-center md:px-16 lg:flex lg:text-left">
				<span className="text-body mb-4 block text-sm lg:mb-0">
					Taran "tearing it up" Bains
				</span>
				<div className="block grow flex-wrap justify-center lg:flex lg:justify-end">
					<NavLink
						prefetch="intent"
						className="text-body mb-2 block px-8 text-sm underline"
						to={`/til?${searchParamsWithoutOffset}`}
					>
						TIL
					</NavLink>
					<NavLink
						prefetch="intent"
						className="text-body mb-2 block px-8 text-sm underline"
						to={`/about?${searchParamsWithoutOffset}`}
					>
						ABOUT
					</NavLink>
					<NavLink
						prefetch="intent"
						className="text-body mb-2 block px-8 text-sm underline"
						to={`/blog?${searchParamsWithoutOffset}`}
					>
						BLOG
					</NavLink>
					<NavLink
						prefetch="intent"
						className="text-body mb-2 block px-8 text-sm underline"
						to={`/uses?${searchParamsWithoutOffset}`}
					>
						USES
					</NavLink>
					<NavLink
						prefetch="intent"
						target="_blank"
						className="text-body mb-2 flex justify-center px-8 text-sm underline"
						to={`/newsletter/rss.xml`}
					>
						Newsletter RSS
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="mx-2 size-4"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
							/>
						</svg>
					</NavLink>
				</div>
			</div>
		</footer>
	)
}
