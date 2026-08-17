import dotenvx from '@dotenvx/dotenvx'

const isProduction = process.env.NODE_ENV === 'production'

dotenvx.config({
	path: isProduction ? '.env.production' : '.env',
	strict: isProduction,
})
