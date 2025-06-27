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

export const updateEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    startDate: vine.date({
      formats: ['YYYY-MM-DD'],
    }).optional(),
    endDate: vine.date({
      formats: ['YYYY-MM-DD'],
    }).optional(),
    startHour: vine.date({
      formats: ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DDTHH:mm:ssZ'],
    }).optional(),
    openHour: vine
      .date({
        formats: ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DDTHH:mm:ssZ'],
      })
      .optional()
      .nullable(),
    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
    placeName: vine.string().trim().minLength(2).maxLength(255).optional(),
    address: vine.string().trim().minLength(5).maxLength(500).optional(),
    city: vine.string().trim().minLength(2).maxLength(100).optional(),
    type: vine.enum(Object.values(EventType)).optional(),
    subtype: vine.enum(Object.values(EventSubtype)).optional(),
    banner: vine.file({
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
      size: '5mb',
    }).optional(),
  })
)

export const getEventsValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    type: vine.enum(Object.values(EventType)).optional(),
    subtype: vine.enum(Object.values(EventSubtype)).optional(),
    city: vine.string().trim().minLength(2).maxLength(100).optional(),
    startDate: vine.date({
      formats: ['YYYY-MM-DD'],
    }).optional(),
    endDate: vine.date({
      formats: ['YYYY-MM-DD'],
    }).optional(),
  })
)

export const eventIdValidator = vine.compile(
  vine.object({
    id: vine.number().min(1),
  })
)
