import { isRouteErrorResponse } from 'react-router'

export function shouldTreatServerRenderErrorAsFatal(error: unknown) {
	if (error instanceof Response) {
		return error.status >= 500
	}

	if (isRouteErrorResponse(error)) {
		return error.status >= 500
	}

	return true
}
