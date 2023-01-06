import { createClient } from 'redis'
import { redisCacheAdapter } from 'cachified'

const client = createClient()
const redisCache = redisCacheAdapter(client)

client.on('error', (err) => console.log('Redis Client Error', err))
client.connect()

export { client as redisClient, redisCache }
