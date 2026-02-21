import * as dateFns from 'date-fns'

/**
 * Adjust a UTC timestamp so that midnight in LA is treated as "today" locally.
 * @param isoUtcString e.g., "2025-08-14T00:00:00.000Z"
 * @returns Date object in UTC, shifted so LA sees the intended date
 */
export function adjustUtcForLA(isoUtcString: string) {
	const date = new Date(isoUtcString)

	// Use the browser's Intl API to determine the actual LA offset at this date
	const laTimeString = date.toLocaleString('en-US', {
		timeZone: 'America/Los_Angeles',
	})
	const laDate = new Date(laTimeString)

	// Calculate the offset in hours
	const offsetMs = date.getTime() - laDate.getTime()
	const offsetHours = offsetMs / (1000 * 60 * 60)

	return dateFns.addHours(date, offsetHours)
}

export function invariantResponse(
	condition: unknown,
	message?: string | (() => string),
	responseInit?: ResponseInit,
): asserts condition {
	if (!condition) {
		throw new Response(
			typeof message === 'function'
				? message()
				: message ||
					'An invariant failed, please provide a message to explain why.',
			{ status: 400, ...responseInit },
		)
	}
}

export function dateFormat(dateString: string) {
	return dateFns.format(parseDate(dateString), 'MMMM dd, yyyy')
}

export function dotFormattedDate(dateString: string) {
	return dateFns.format(parseDate(dateString), 'dd.MM.yyyy')
}

function parseDate(dateString: string) {
	return dateFns.add(dateFns.parseISO(dateString), {
		minutes: new Date(dateString).getTimezoneOffset(),
	})
}
