import { NavLink, useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'

type PaginationProps = {
	currentPage: number
	totalPages: number
	hasNextPage: boolean
	hasPrevPage: boolean
	className?: string
	baseUrl?: string
	preserveParams?: boolean
}

export function Pagination({
	currentPage,
	totalPages,
	hasNextPage,
	hasPrevPage,
	className = '',
	baseUrl = '',
	preserveParams = true,
}: PaginationProps) {
	const [searchParams] = useSearchParams()

	const createPageUrl = (page: number) => {
		const newParams = new URLSearchParams(
			preserveParams ? searchParams.toString() : '',
		)

		newParams.set('page', page.toString())

		return `${baseUrl}?${newParams.toString()}`
	}

	// Generate array of page numbers to display
	const getPageNumbers = () => {
		const pageNumbers = []

		// Show all pages if there are 7 or fewer
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i)
			}
		} else {
			// Always show first page
			pageNumbers.push(1)

			// Calculate start and end of page range around current page
			let startPage = Math.max(2, currentPage - 1)
			let endPage = Math.min(totalPages - 1, currentPage + 1)

			// Add ellipsis after first page if needed
			if (startPage > 2) {
				pageNumbers.push('ellipsis-start')
			}

			// Add pages around current page
			for (let i = startPage; i <= endPage; i++) {
				pageNumbers.push(i)
			}

			// Add ellipsis before last page if needed
			if (endPage < totalPages - 1) {
				pageNumbers.push('ellipsis-end')
			}

			// Always show last page
			pageNumbers.push(totalPages)
		}

		return pageNumbers
	}

	const pageNumbers = getPageNumbers()

	return (
		<div
			className={twMerge('flex items-center justify-center gap-2', className)}
		>
			{hasPrevPage && (
				<NavLink
					to={createPageUrl(currentPage - 1)}
					className={() =>
						twMerge(
							'border-medium-gray inline-flex items-center justify-center rounded-md border border-solid px-3 py-2 text-sm font-medium transition-colors hover:bg-white focus-visible:outline-2 dark:border-white',
						)
					}
					aria-label="Previous page"
				>
					←
				</NavLink>
			)}

			<div className="flex items-center gap-1">
				{pageNumbers.map((page, index) =>
					typeof page === 'number' ? (
						<NavLink
							key={index}
							to={createPageUrl(page)}
							className={() =>
								twMerge(
									'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
									page === currentPage
										? 'bg-white font-medium'
										: 'hover:bg-white',
								)
							}
							aria-label={`Page ${page}`}
							aria-current={page === currentPage ? 'page' : undefined}
						>
							{page}
						</NavLink>
					) : (
						<span
							key={index}
							className="inline-flex h-8 w-8 items-center justify-center text-sm"
						>
							…
						</span>
					),
				)}
			</div>

			{hasNextPage && (
				<NavLink
					to={createPageUrl(currentPage + 1)}
					className={({ isActive }) =>
						twMerge(
							'border-medium-gray inline-flex items-center justify-center rounded-md border border-solid px-3 py-2 text-sm font-medium transition-colors hover:bg-white focus-visible:outline-2 dark:border-white',
							isActive ? 'text-accent' : '',
						)
					}
					aria-label="Next page"
				>
					→
				</NavLink>
			)}
		</div>
	)
}
