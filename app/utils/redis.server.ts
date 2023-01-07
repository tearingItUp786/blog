import * as redis from 'redis'
import { redisCacheAdapter } from 'cachified'

declare global {
  // This prevents us from making multiple connections to the db when the
  // require cache is cleared.
  // eslint-disable-next-line
  var primaryClient: redis.RedisClientType | undefined
}

function createRedisClient(): redis.RedisClientType {
  let client = global.primaryClient

  if (!client) {
    // eslint-disable-next-line no-multi-assign
    client = global.primaryClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    })

    client.on('error', (error: string) => {
      console.error(`REDIS ERROR:`, error)
    })

    client.connect()
  }

  return client
}

let redisClient = createRedisClient()
const redisCache = redisCacheAdapter(redisClient)

export { redisClient, redisCache }
