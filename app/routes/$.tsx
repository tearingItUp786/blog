export const loader = async () => {
	// This route will catch any request with a file extension that doesn't match other routes
	// Return a 404 response
	throw new Response('Not Found', { status: 404 })
}

export default function CatchAll() {
	// This component will never render because the loader always throws
	return null
}
