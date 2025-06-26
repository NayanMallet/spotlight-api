import Event from '#events/models/event'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import { EventType, EventSubtype } from '#events/enums/events'

@inject()
export class EventsService {
  /**
   * Stores a new event in the database.
   * @param data - The event data excluding the banner.
   * @param banner - The banner file to be uploaded.
   * @return A promise that resolves to the created Event instance.
   */
  async create(
    data: {
      description?: string | null | undefined
      openHour?: Date | null | undefined
      title: string
      startDate: Date
      endDate: Date
      startHour: Date
      latitude: number
      longitude: number
      placeName: string
      address: string
      city: string
      type: EventType
      subtype: EventSubtype
    },
    banner: MultipartFile
  ): Promise<Event> {
    const eventData = {
      ...data,
      startDate: data.startDate ? DateTime.fromJSDate(data.startDate) : undefined,
      endDate: data.endDate ? DateTime.fromJSDate(data.endDate) : undefined,
      startHour: data.startHour ? DateTime.fromJSDate(data.startHour) : undefined,
      openHour: data.openHour ? DateTime.fromJSDate(data.openHour) : null,
    }

    const event = await Event.create(eventData)

    const fileName = `events/banner_${event.id}.${banner.extname}`
    await banner.move(app.makePath('storage/uploads/events'), {
      name: fileName,
      overwrite: true,
    })

    event.bannerUrl = `/uploads/events/${fileName}`
    await event.save()

    return event
  }
}
