import * as redis from 'redis'
import {redisJsonCacheAdapter} from 'cachified-redis-json-adapter'

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
      username: 'default',
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        family: 4,
        // family: 6,
      },
    })

    client.on('error', (error: string) => {
      console.error(`REDIS ERROR:`, error)
    })

    client.connect()
  }

  return client
}

let redisClient = createRedisClient()

const redisCache = redisJsonCacheAdapter(redisClient)

async function delRedisKey(key: string) {
  console.log('key to delete is', key)
  return await redisClient.del(key)
}

export {redisClient, redisCache, delRedisKey}
