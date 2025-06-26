import vine from '@vinejs/vine'
import { EventType, EventSubtype } from '#events/enums/events'

export const createEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().optional().nullable(),
    startDate: vine.date(),
    endDate: vine.date(),
    startHour: vine.date(),
    openHour: vine.date().optional().nullable(),
    latitude: vine.number(),
    longitude: vine.number(),
    placeName: vine.string().trim(),
    address: vine.string().trim(),
    city: vine.string().trim(),
    type: vine.enum(Object.values(EventType)),
    subtype: vine.enum(Object.values(EventSubtype)),
    banner: vine.file({
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
      size: '5mb',
    }),
  })
)
