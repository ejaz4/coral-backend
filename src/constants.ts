import { PrismaClient } from '@prisma/client'

export const EMAIL_REGEX = `^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$`
export const prisma = new PrismaClient()
export const UUID_REGEX = `^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$`
export const MINIMUM_PASSWORD_LENGTH = 10
export const MAXIMUM_PASSWORD_LENGTH = 128
export const MINIMUM_USERNAME_LENGTH = 1
export const MAXIMUM_USERNAME_LENGTH = 32
export const MINIMUM_NAME_LENGTH = 1
export const MAXIMUM_NAME_LENGTH = 128
export const PROFILE_PICTURE_REGEX = `^https:\/\/cdn.coral.video\/.*\.(png|svg)$`
