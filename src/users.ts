import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import {
  EMAIL_REGEX,
  MAXIMUM_NAME_LENGTH,
  MAXIMUM_PASSWORD_LENGTH,
  MAXIMUM_USERNAME_LENGTH,
  MINIMUM_NAME_LENGTH,
  MINIMUM_PASSWORD_LENGTH,
  MINIMUM_USERNAME_LENGTH,
  prisma,
  PROFILE_PICTURE_REGEX,
  UUID_REGEX
} from './constants'
import { FastifyPluginCallback } from 'fastify'
import { verifyUser } from './utils'
import { Language } from '@prisma/client'

export const users: FastifyPluginCallback = (server, opts, done) => {
  server.post<{
    Body: {
      username: string
      password: string
      email: string
      name: string
      profilePicture: string
    }
  }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              minimumLength: MINIMUM_USERNAME_LENGTH,
              maxLength: MAXIMUM_USERNAME_LENGTH
            },
            email: {
              type: 'string',
              pattern: EMAIL_REGEX
            },
            password: {
              type: 'string',
              minimumLength: MINIMUM_PASSWORD_LENGTH,
              maxLength: MAXIMUM_PASSWORD_LENGTH
            },
            name: {
              type: 'string',
              minimumLength: MINIMUM_NAME_LENGTH,
              maxLength: MAXIMUM_NAME_LENGTH
            },
            profilePicture: {
              type: 'string',
              pattern: PROFILE_PICTURE_REGEX
            }
          },
          required: ['email', 'password', 'username', 'name']
        }
      }
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: {
          email: request.body.email
        }
      })
      if (user) {
        reply.code(400)
        return { success: false, error: 'Email is Taken' }
      }
      await prisma.user.create({
        data: {
          username: request.body.username,
          password: await argon2.hash(request.body.password),
          email: request.body.email,
          name: request.body.name,
          profilePicture: request.body.profilePicture
        }
      })
      return { success: true }
    }
  )

  server.post<{
    Body: { password: string; email: string }
  }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              pattern: EMAIL_REGEX
            },
            password: {
              type: 'string',
              minimumLength: MINIMUM_PASSWORD_LENGTH,
              maxLength: MAXIMUM_PASSWORD_LENGTH
            }
          },
          required: ['email', 'password']
        }
      }
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: {
          email: request.body.email
        }
      })
      if (!user) {
        reply.code(404)
        return { success: false, error: 'User Not Found' }
      }
      if (!(await argon2.verify(user.password, request.body.password))) {
        reply.code(403)
        return { success: false, error: 'Invalid Password' }
      }
      return {
        success: true,
        token: jwt.sign(
          {
            sub: user.id,
            iat: Math.floor(new Date().getTime() / 1000),
            exp: Math.floor(new Date().getTime() / 1000) + 604800,
            iss: 'api.coral.video',
            aud: 'coral.video'
          },
          process.env.JWT_TOKEN!
        )
      }
    }
  )

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
      const user = await prisma.user.findUnique({
        where: {
          id: request.params.id
        }
      })
      if (!user) {
        reply.code(404)
        return { success: false, error: 'User Not Found' }
      }
      return {
        success: true,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture,
        language: user.language
      }
    }
  )

  server.patch<{
    Params: { id: string }
    Body: {
      username?: string
      password?: string
      email?: string
      name?: string
      profilePicture?: string
      language?: Language
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
            username: {
              type: 'string',
              minimumLength: MINIMUM_USERNAME_LENGTH,
              maxLength: MAXIMUM_USERNAME_LENGTH
            },
            email: {
              type: 'string',
              pattern: EMAIL_REGEX
            },
            password: {
              type: 'string',
              minimumLength: MINIMUM_PASSWORD_LENGTH,
              maxLength: MAXIMUM_PASSWORD_LENGTH
            },
            name: {
              type: 'string',
              minimumLength: MINIMUM_NAME_LENGTH,
              maxLength: MAXIMUM_NAME_LENGTH
            },
            profilePicture: {
              type: 'string',
              pattern: PROFILE_PICTURE_REGEX
            },
            language: {
              type: 'string',
              enum: ['en', 'ja', 'fr', 'es']
            }
          }
        }
      }
    },
    async (request, reply) => {
      if ((request.user as { sub: string }).sub !== request.params.id) {
        reply.code(403)
        return {
          success: false,
          error: 'You do not have authorization to modify the data of this user'
        }
      }
      await prisma.user.update({
        where: {
          id: request.params.id
        },
        data: {
          username: request.body.username,
          password: request.body.password
            ? await argon2.hash(request.body.password)
            : undefined,
          email: request.body.email,
          name: request.body.name,
          profilePicture: request.body.profilePicture,
          language: request.body.language
        }
      })
      return {
        success: true
      }
    }
  )
  done()
}
