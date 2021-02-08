import {
  MAXIMUM_NAME_LENGTH,
  MINIMUM_NAME_LENGTH,
  prisma,
  PROFILE_PICTURE_REGEX,
  UUID_REGEX
} from './constants'
import { FastifyPluginCallback } from 'fastify'
import { verifyUser } from './utils'

export const channels: FastifyPluginCallback = (server, opts, done) => {
  server.get<{
    Params: { id: string }
  }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', pattern: UUID_REGEX }
          },
          required: ['id']
        }
      }
    },
    async (request, reply) => {
      const channel = await prisma.channel.findUnique({
        where: {
          id: request.params.id
        }
      })
      if (!channel) {
        reply.code(404)
        return { success: false, error: 'Channel Not Found' }
      }
      return {
        success: true,
        name: channel.name,
        videos: (
          await prisma.video.findMany({
            where: { channelId: request.params.id }
          })
        ).map((video) => ({
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          cdnLocation: video.cdnLocation
        })),
        profilePicture: channel.profilePicture
      }
    }
  )

  server.post<{
    Body: {
      name: string
    }
  }>(
    '/',
    {
      preValidation: [verifyUser],
      schema: {
        body: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minimumLength: MINIMUM_NAME_LENGTH,
              maxLength: MAXIMUM_NAME_LENGTH
            },
            profilePicture: {
              type: 'string',
              pattern: PROFILE_PICTURE_REGEX
            }
          }
        }
      }
    },
    async (request, reply) => {
      const channel = await prisma.channel.create({
        data: {
          name: request.body.name,
          user: {
            connect: {
              id: (request.user as { sub: string }).sub
            }
          }
        }
      })
      return {
        success: true,
        id: channel.id,
        profilePicture: channel.profilePicture
      }
    }
  )
  done()
}
