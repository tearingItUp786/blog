import * as redis from 'redis'
import type {CacheMetadata} from 'cachified'

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
      pingInterval: 4 * 60 * 1000,
      socket: {
        family: 6,
      },
    })

    client.on('error', (error: string) => {
      console.error(`REDIS ERROR:`, error)
    })

    client.connect()
  }

  return client
}

function staleWhileRevalidate(metadata: CacheMetadata): number | null {
  return typeof metadata.swr === 'undefined' ? null : metadata.swr
}

function totalTtl(metadata?: CacheMetadata): number {
  if (!metadata) {
    return 0
  }
  if (metadata.ttl === null) {
    return Infinity
  }
  return (metadata.ttl || 0) + (staleWhileRevalidate(metadata) || 0)
}

const myRedisAdapter: (args: redis.RedisClientType) => any = rc => {
  return {
    name: 'myRedisAdapter',
    delete(key: string) {
      return rc.json.del(key)
    },
    async get(key: string) {
      const val = await rc.json.get(key)
      if (val == null) {
        return null
      }

      return val
    },
    async set(key: string, value: Record<string, any>) {
      const ttl = totalTtl(value?.metadata)
      const createdTime = value?.metadata?.createdTime

      const setOp = await rc.json.set(key, '$', value)
      if (ttl > 0 && ttl < Infinity && typeof createdTime === 'number') {
        await rc.expireAt(key, Math.ceil((ttl + createdTime) / 1000))
      }

      return setOp
    },
  }
}

let redisClient = createRedisClient()
// const redisCache = redisCacheAdapter(redisClient)
const redisCache = myRedisAdapter(redisClient)

async function delRedisKey(key: string) {
  console.log('key to delete is', key)
  return await redisClient.del(key)
}

export {redisClient, redisCache, delRedisKey}
