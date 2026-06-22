const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

const REACT_ROUTER_DATA_SUFFIX = '.data'

const ALLOWED_DOT_SEGMENTS = new Set(['.well-known'])

const DANGEROUS_PATH_SEGMENTS = new Set([
	'cgi-bin',
	'phpmyadmin',
	'pma',
	'adminer',
	'server-status',
	'server-info',
	'vendor',
	'wp-admin',
	'wp-content',
	'wp-includes',
	'wordpress',
])

const DANGEROUS_EXTENSIONS = new Set([
	'asp',
	'aspx',
	'bak',
	'cgi',
	'env',
	'ini',
	'jsp',
	'log',
	'php',
	'php3',
	'php4',
	'php5',
	'phtml',
	'pl',
	'sql',
	'swf',
])

const SENSITIVE_FILENAMES = new Set([
	'.env',
	'.env.local',
	'.env.production',
	'.gitignore',
	'composer.json',
	'composer.lock',
	'config.php',
	'database.sql',
	'id_rsa',
	'package-lock.json',
	'pnpm-lock.yaml',
	'web.config',
	'yarn.lock',
])

function getPathname(path) {
	try {
		return new URL(path, 'http://localhost').pathname
	} catch {
		return path.split('?')[0] || '/'
	}
}

function decodePathname(pathname) {
	try {
		return decodeURIComponent(pathname)
	} catch {
		return pathname
	}
}

function getSegments(pathname) {
	return decodePathname(pathname)
		.replaceAll('\\', '/')
		.toLowerCase()
		.split('/')
		.filter(Boolean)
}

function getExtension(segment) {
	const lastDotIndex = segment.lastIndexOf('.')

	if (lastDotIndex <= 0 || lastDotIndex === segment.length - 1) {
		return ''
	}

	return segment.slice(lastDotIndex + 1)
}

function normalizeReactRouterDataPathname(pathname) {
	const lowerPathname = pathname.toLowerCase()

	if (lowerPathname === '/_root.data') {
		return '/'
	}

	if (lowerPathname.endsWith(REACT_ROUTER_DATA_SUFFIX)) {
		return pathname.slice(0, -REACT_ROUTER_DATA_SUFFIX.length) || '/'
	}

	return pathname
}

export function isHostileProbeRequest({ method, path }) {
	const methodName = method.toUpperCase()
	const segments = getSegments(normalizeReactRouterDataPathname(getPathname(path)))
	const lastSegment = segments.at(-1) ?? ''
	const extension = getExtension(lastSegment)

	if (
		segments.some(
			(segment) =>
				segment.startsWith('.') && !ALLOWED_DOT_SEGMENTS.has(segment),
		)
	) {
		return true
	}

	if (DANGEROUS_PATH_SEGMENTS.has(segments[0])) {
		return true
	}

	if (SENSITIVE_FILENAMES.has(lastSegment)) {
		return true
	}

	if (extension && DANGEROUS_EXTENSIONS.has(extension)) {
		return true
	}

	if (!SAFE_METHODS.has(methodName) && extension) {
		return true
	}

	return false
}

export function hostileRequestGuard(req, res, next) {
	if (
		isHostileProbeRequest({ method: req.method, path: req.path ?? req.url ?? '/' })
	) {
		res.status(404).type('text/plain').send('Not Found')
		return
	}

	next()
}
