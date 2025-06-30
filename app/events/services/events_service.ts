import Event from '#events/models/event'
import EventArtist from '#events/models/event_artist'
import Artist from '#artists/models/artist'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import { EventType, EventSubtype } from '#events/enums/events'
import { cuid } from '@adonisjs/core/helpers'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

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
  artistIds?: number[]
}

export interface UpdateEventData {
  title?: string
  description?: string | null
  startDate?: Date
  endDate?: Date
  startHour?: Date
  openHour?: Date | null
  latitude?: number
  longitude?: number
  placeName?: string
  address?: string
  city?: string
  type?: EventType
  subtype?: EventSubtype
  artistIds?: number[]
}

export interface GetEventsOptions {
  page?: number
  limit?: number
  type?: EventType
  subtype?: EventSubtype
  city?: string
  startDate?: Date
  endDate?: Date
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

    // Validate artists exist if provided
    if (data.artistIds && data.artistIds.length > 0) {
      const existingArtists = await Artist.query().whereIn('id', data.artistIds)
      if (existingArtists.length !== data.artistIds.length) {
        const existingIds = existingArtists.map(artist => artist.id)
        const missingIds = data.artistIds.filter(id => !existingIds.includes(id))
        throw new Error(`Artists not found: ${missingIds.join(', ')}`)
      }
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

      // Create event-artist relationships if artists are provided
      if (data.artistIds && data.artistIds.length > 0) {
        const eventArtistData = data.artistIds.map(artistId => ({
          eventId: event.id,
          artistId: artistId,
        }))
        await EventArtist.createMany(eventArtistData)
      }

      return event
    } catch (error) {
      // If file upload or artist association fails, delete the created event to maintain consistency
      await event.delete()
      throw new Error(`Failed to upload banner image or associate artists: ${error.message}`)
    }
  }

  /**
   * Retrieves all events with optional filtering and pagination.
   * @param options - Filtering and pagination options.
   * @return A promise that resolves to paginated events.
   */
  async getAll(options: GetEventsOptions = {}) {
    const { page = 1, limit = 20, type, subtype, city, startDate, endDate } = options

    const query = Event.query()

    // Apply filters
    if (type) {
      query.where('type', type)
    }

    if (subtype) {
      query.where('subtype', subtype)
    }

    if (city) {
      query.whereILike('city', `%${city}%`)
    }

    if (startDate) {
      query.where('startDate', '>=', DateTime.fromJSDate(startDate).toSQLDate()!)
    }

    if (endDate) {
      query.where('endDate', '<=', DateTime.fromJSDate(endDate).toSQLDate()!)
    }

    // Order by start date
    query.orderBy('startDate', 'asc')

    // Apply pagination
    return await query.paginate(page, limit)
  }

  /**
   * Retrieves a single event by ID.
   * @param id - The event ID.
   * @return A promise that resolves to the Event instance or null if not found.
   */
  async getById(id: number): Promise<Event | null> {
    return await Event.find(id)
  }

  /**
   * Updates an existing event.
   * @param id - The event ID.
   * @param data - The updated event data.
   * @param banner - Optional new banner file.
   * @return A promise that resolves to the updated Event instance.
   * @throws Error if event is not found or update fails
   */
  async update(id: number, data: UpdateEventData, banner?: MultipartFile): Promise<Event> {
    const event = await Event.find(id)
    if (!event) {
      throw new Error('Event not found')
    }

    // Validate artists exist if provided
    if (data.artistIds !== undefined) {
      if (data.artistIds.length > 0) {
        const existingArtists = await Artist.query().whereIn('id', data.artistIds)
        if (existingArtists.length !== data.artistIds.length) {
          const existingIds = existingArtists.map(artist => artist.id)
          const missingIds = data.artistIds.filter(id => !existingIds.includes(id))
          throw new Error(`Artists not found: ${missingIds.join(', ')}`)
        }
      }
    }

    // Update event fields
    if (data.title !== undefined) event.title = data.title
    if (data.description !== undefined) event.description = data.description
    if (data.startDate !== undefined) event.startDate = DateTime.fromJSDate(data.startDate)
    if (data.endDate !== undefined) event.endDate = DateTime.fromJSDate(data.endDate)
    if (data.startHour !== undefined) event.startHour = DateTime.fromJSDate(data.startHour)
    if (data.openHour !== undefined) {
      event.openHour = data.openHour ? DateTime.fromJSDate(data.openHour) : null
    }
    if (data.latitude !== undefined) event.latitude = data.latitude
    if (data.longitude !== undefined) event.longitude = data.longitude
    if (data.placeName !== undefined) event.placeName = data.placeName
    if (data.address !== undefined) event.address = data.address
    if (data.city !== undefined) event.city = data.city
    if (data.type !== undefined) event.type = data.type
    if (data.subtype !== undefined) event.subtype = data.subtype

    // Handle banner update if provided
    if (banner) {
      // Validate file type
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
      if (!allowedExtensions.includes(banner.extname || '')) {
        throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`)
      }

      // Delete old banner image if it exists
      if (event.bannerUrl && event.bannerUrl.startsWith('/uploads/events/')) {
        try {
          const oldFileName = event.bannerUrl.replace('/uploads/events/', '')
          const oldFilePath = join(app.publicPath('uploads/events'), oldFileName)
          await unlink(oldFilePath)
        } catch (error) {
          // Log the error but continue with upload
          console.warn(`Failed to delete old banner image for event ${event.id}:`, error.message)
        }
      }

      try {
        // Upload new banner file
        const fileName = `event_${event.id}_${cuid()}.${banner.extname}`

        await banner.move(app.publicPath('uploads/events'), {
          name: fileName,
          overwrite: true,
        })

        // Update event with new banner URL
        event.bannerUrl = `/uploads/events/${fileName}`
      } catch (error) {
        throw new Error(`Failed to upload banner image: ${error.message}`)
      }
    }

    // Handle artist associations update if provided
    if (data.artistIds !== undefined) {
      // Remove existing artist associations
      await EventArtist.query().where('eventId', event.id).delete()

      // Create new artist associations if any
      if (data.artistIds.length > 0) {
        const eventArtistData = data.artistIds.map(artistId => ({
          eventId: event.id,
          artistId: artistId,
        }))
        await EventArtist.createMany(eventArtistData)
      }
    }

    await event.save()
    return event
  }

  /**
   * Deletes an event by ID and its associated banner image.
   * @param id - The event ID.
   * @return A promise that resolves to true if deleted, false if not found.
   */
  async delete(id: number): Promise<boolean> {
    const event = await Event.find(id)
    if (!event) {
      return false
    }

    // Delete the banner image file if it exists
    if (event.bannerUrl && event.bannerUrl.startsWith('/uploads/events/')) {
      try {
        const fileName = event.bannerUrl.replace('/uploads/events/', '')
        const filePath = join(app.publicPath('uploads/events'), fileName)
        await unlink(filePath)
      } catch (error) {
        // Log the error but don't fail the deletion if file doesn't exist
        console.warn(`Failed to delete banner image for event ${id}:`, error.message)
      }
    }

    await event.delete()
    return true
  }
}
