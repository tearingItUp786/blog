import {redisJsonCacheAdapter} from 'cachified-redis-json-adapter'
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
      .catch(err => {
        console.error('🌱 error connecting to redis', err)
        throw err
      })
  }

  return client
}

const redisClient = createRedisClient()

const redisCache = redisJsonCacheAdapter(redisClient)

async function delRedisKey(key: string) {
  console.log('key to delete is', key)
  return await redisClient.del(key)
}

export {redisClient, redisCache, delRedisKey}
