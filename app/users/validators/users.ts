import vine from '@vinejs/vine'

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
  })
)
