import { type Cache } from '@epic-web/cachified'
import { redisJsonCacheAdapter } from 'cachified-redis-json-adapter'
import * as redis from 'redis'

declare global {
	// This prevents us from making multiple connections to the db when the
	// require cache is cleared.

	var primaryClient: redis.RedisClientType | undefined
}

function createRedisClient(): redis.RedisClientType {
	let client = global.primaryClient

	if (!client) {
		client = global.primaryClient = redis.createClient({
			username: 'default',
			password: process.env.REDIS_PASSWORD,
			disableOfflineQueue: true,
			pingInterval: 4 * 60 * 1000,
			socket: {
				host: process.env.REDIS_HOST,
				port: Number(process.env.REDIS_PORT || 6379),
				family: 6,
			},
		})

		client.on('error', (error: string) => {
			console.error(`REDIS ERROR:`, error)
		})

		client
			.connect()
			.then(() => {
				console.log('🌱 connected to redis')
			})
			.catch((err) => {
				console.error('🌱 error connecting to redis', err)
				throw err
			})
	}

	return client
}

const redisClient = createRedisClient()

const cacheAdapter = redisJsonCacheAdapter(redisClient)

async function withRedisCache<T>(key: string, operation: () => T | Promise<T>) {
	// Cache availability must not prevent loaders from fetching fresh data.
	if (!redisClient.isReady) return
	let deadline: ReturnType<typeof setTimeout> | undefined
	try {
		// node-redis's command timeout covers queued commands, not replies to
		// commands already sent. Bound the entire operation as well.
		return await Promise.race([
			operation(),
			new Promise<never>((_resolve, reject) => {
				deadline = setTimeout(() => reject(new redis.TimeoutError()), 2_000)
			}),
		])
	} catch (error) {
		console.error(`Redis cache unavailable for ${key}; bypassing cache.`, error)
		// A command timeout does not close node-redis's socket. Replace the
		// stuck connection so future requests can use the cache again.
		if (error instanceof redis.TimeoutError && redisClient.isReady) {
			redisClient.destroy()
			void redisClient.connect().catch((err) => {
				console.error('Error reconnecting to redis', err)
			})
		}
		return undefined
	} finally {
		clearTimeout(deadline)
	}
}

const redisCache: Cache = {
	get: (key) => withRedisCache(key, () => cacheAdapter.get(key)),
	set: (key, value) => withRedisCache(key, () => cacheAdapter.set(key, value)),
	delete: (key) => withRedisCache(key, () => cacheAdapter.delete(key)),
}

async function delRedisKey(key: string) {
	console.log('key to delete is', key)
	return await redisClient.del(key)
}

export { redisClient, redisCache, delRedisKey }
