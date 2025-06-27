import Event from '#events/models/event'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import { EventType, EventSubtype } from '#events/enums/events'
import { cuid } from '@adonisjs/core/helpers'

export interface CreateEventData {
  title: string
  description?: string | null
  startDate: Date
  endDate: Date
  startHour: Date
  openHour?: Date | null
  latitude: number
  longitude: number
  placeName: string
  address: string
  city: string
  type: EventType
  subtype: EventSubtype
}

@inject()
export class EventsService {
  /**
   * Stores a new event in the database.
   * @param data - The event data excluding the banner.
   * @param banner - The banner file to be uploaded.
   * @return A promise that resolves to the created Event instance.
   * @throws Error if banner is not provided or file upload fails
   */
  async create(data: CreateEventData, banner: MultipartFile): Promise<Event> {
    if (!banner) {
      throw new Error('Banner image is required')
    }

    // Validate file type
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowedExtensions.includes(banner.extname || '')) {
      throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`)
    }

    // Create event record
    const event = await Event.create({
      title: data.title,
      description: data.description ?? null,
      startDate: DateTime.fromJSDate(data.startDate),
      endDate: DateTime.fromJSDate(data.endDate),
      startHour: DateTime.fromJSDate(data.startHour),
      openHour: data.openHour ? DateTime.fromJSDate(data.openHour) : null,
      latitude: data.latitude,
      longitude: data.longitude,
      placeName: data.placeName,
      address: data.address,
      city: data.city,
      type: data.type,
      subtype: data.subtype,
    })

    try {
      // Upload banner file
      const fileName = `event_${event.id}_${cuid()}.${banner.extname}`

      await banner.move(app.publicPath('uploads/events'), {
        name: fileName,
        overwrite: true,
      })

      // Update event with banner URL
      event.bannerUrl = `/uploads/events/${fileName}`
      await event.save()

      return event
    } catch (error) {
      // If file upload fails, delete the created event to maintain consistency
      await event.delete()
      throw new Error(`Failed to upload banner image: ${error.message}`)
    }
  }
}
