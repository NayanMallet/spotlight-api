import vine from '@vinejs/vine'
import { EventType, EventSubtype } from '#events/enums/events'

export const createEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    startDate: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    endDate: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    startHour: vine.date({
      formats: ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DDTHH:mm:ssZ'],
    }),
    openHour: vine
      .date({
        formats: ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DDTHH:mm:ssZ'],
      })
      .optional()
      .nullable(),
    latitude: vine.number().range([-90, 90]),
    longitude: vine.number().range([-180, 180]),
    placeName: vine.string().trim().minLength(2).maxLength(255),
    address: vine.string().trim().minLength(5).maxLength(500),
    city: vine.string().trim().minLength(2).maxLength(100),
    type: vine.enum(Object.values(EventType)),
    subtype: vine.enum(Object.values(EventSubtype)),
    banner: vine.file({
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
      size: '5mb',
    }),
  })
)
