import vine from '@vinejs/vine'

const bannerImage = {
  extnames: ['jpg', 'jpeg', 'png', 'webp'],
  size: '5mb',
}

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email(),
    password: vine.string().trim().minLength(8).maxLength(255),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().trim().toLowerCase().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().trim().minLength(8).maxLength(255),
    bannerUrl: vine.string().trim().url().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim().minLength(3).maxLength(255).optional(),
    email: vine.string().trim().toLowerCase().email().optional(),
    password: vine.string().trim().minLength(8).maxLength(255).optional(),
    banner: vine.file(bannerImage).optional(),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email(),
    newPassword: vine.string().trim().minLength(8).maxLength(255),
  })
)

export const uploadUserBannerValidator = vine.compile(
  vine.object({
    banner: vine.file(bannerImage),
  })
)
