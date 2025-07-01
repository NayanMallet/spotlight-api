import vine from '@vinejs/vine'

export const createArtistValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    image: vine.file({
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
      size: '5mb',
    }),
  })
)

export const updateArtistValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    image: vine
      .file({
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
        size: '5mb',
      })
      .optional(),
  })
)

export const artistIdValidator = vine.compile(
  vine.object({
    id: vine.number().min(1),
  })
)
