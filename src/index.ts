import { users } from './users'
import { videos } from './videos'
import { fastify, FastifyReply, FastifyRequest } from 'fastify'
import { channels } from './channels'
import cors from 'fastify-cors'
import fastifyJWT from 'fastify-jwt'
import 'dotenv/config'

const server = fastify({ logger: true })

server.register(fastifyJWT, {
  secret: process.env.JWT_TOKEN!
})

server.register(cors, {
  origin: ['https://coral.video', 'https://www.coral.video'],
  allowedHeaders: ['Content-Type', 'Authorization']
})

server.get('/', async (_, reply) => {
  reply.redirect('https://coral.video')
})

server.register(users, { prefix: '/users' })
server.register(videos, { prefix: '/videos' })
server.register(channels, { prefix: '/channels' })

const start = async () => {
  try {
    await server.listen(3000, '0.0.0.0')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()
