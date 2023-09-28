import {setupServer} from 'msw/node'
import {githubHandlers} from './github'

const server = setupServer(...githubHandlers)

server.listen({onUnhandledRequest: 'warn'})
console.info('🔶 Mock server installed')

process.once('SIGINT', () => server.close())
process.once('SIGTERM', () => server.close())
