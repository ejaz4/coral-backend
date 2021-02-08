import { prisma, UUID_REGEX } from './constants'
import { FastifyPluginCallback } from 'fastify'
import { verifyUser } from './utils'

export const videos: FastifyPluginCallback = (server, opts, done) => {
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
      const video = await prisma.video.findUnique({
        where: {
          id: request.params.id
        }
      })
      if (!video) {
        reply.code(404)
        return { success: false, error: 'Video Not Found' }
      }
      return {
        success: true,
        title: video.title,
        description: video.description,
        cdnLocation: video.cdnLocation,
        thumbnail: video.thumbnail,
        channelID: video.channelId
      }
    }
  )

  server.patch<{
    Params: { id: string }
    Body: {
      title: string
      description: string
      thumbnail: string
    }
  }>(
    '/:id',
    {
      preValidation: [verifyUser],
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', pattern: UUID_REGEX }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 128 },
            description: { type: 'string' },
            thumbnail: { type: 'string' }
          }
        }
      }
    },
    async (request, reply) => {
      const userId = (
        await prisma.video
          .findUnique({
            where: {
              id: request.params.id
            }
          })
          .channel()
      )?.userId
      if ((request.user as { sub: string }).sub !== userId) {
        reply.code(403)
        return {
          success: false,
          error:
            'You do not have authorization to modify the data of this video'
        }
      }
      await prisma.video.update({
        where: {
          id: request.params.id
        },
        data: {
          title: request.body.title,
          description: request.body.description,
          thumbnail: request.body.thumbnail
        }
      })
      return {
        success: true
      }
    }
  )
  done()
}
