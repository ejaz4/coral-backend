import { FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt, { FastifyJWTOptions } from 'fastify-jwt'

export const verifyUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
}
