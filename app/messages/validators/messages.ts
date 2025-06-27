import vine from '@vinejs/vine'

export const createMessageValidator = vine.compile(
  vine.object({
    eventId: vine.string().trim().minLength(1),
    content: vine.string().trim().minLength(1).maxLength(1000),
  })
)

export const updateMessageValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1).maxLength(1000),
  })
)

export const getMessagesByEventValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const messageIdValidator = vine.compile(
  vine.object({
    id: vine.string().trim().minLength(1),
  })
)

export const eventIdValidator = vine.compile(
  vine.object({
    eventId: vine.string().trim().minLength(1),
  })
)
