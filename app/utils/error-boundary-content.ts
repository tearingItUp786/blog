import { isRouteErrorResponse } from 'react-router'

export type ErrorBoundaryContent = {
	heading: string
	iframeTitle: string
	iframeSrc: string
	iframeWidth: string
	iframeHeight: string
	iframeClassName: string
	iframeContainerClassName?: string
	creditHref: string
	creditContainerClassName?: string
	creditLinkClassName?: string
}

export function shouldCaptureErrorBoundaryError(error: unknown) {
	return !isRouteErrorResponse(error)
}

export function getErrorBoundaryContent(error: unknown): ErrorBoundaryContent {
	if (isRouteErrorResponse(error)) {
		return {
			heading: `Not found: ${error.status}`,
			iframeTitle: 'Not Found',
			iframeSrc: 'https://giphy.com/embed/UHAYP0FxJOmFBuOiC2',
			iframeWidth: '480',
			iframeHeight: '361',
			iframeClassName: 'giphy-embed',
			creditHref:
				'https://giphy.com/gifs/gengar-jijidraws-jiji-knight-UHAYP0FxJOmFBuOiC2',
			creditContainerClassName: 'text-accent',
			creditLinkClassName: 'text-accent',
		}
	}

	return {
		heading: 'Something went wrong with the server',
		iframeTitle: 'Not sure what happened',
		iframeSrc: 'https://giphy.com/embed/7wUn5bkB2fUBY8Jo1D',
		iframeWidth: '100%',
		iframeHeight: '100%',
		iframeClassName: 'giphy-embed absolute',
		iframeContainerClassName: 'relative h-0 w-full pb-[56%]',
		creditHref:
			'https://giphy.com/gifs/ThisIsMashed-animation-animated-mashed-7wUn5bkB2fUBY8Jo1D',
	}
}
