import vine from '@vinejs/vine'

export const bookmarkEventValidator = vine.compile(
  vine.object({
    eventId: vine.number().min(1),
  })
)

export const removeBookmarkValidator = vine.compile(
  vine.object({
    eventId: vine.number().min(1),
  })
)

export const getUserBookmarksValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const checkBookmarkValidator = vine.compile(
  vine.object({
    eventId: vine.number().min(1),
  })
)
