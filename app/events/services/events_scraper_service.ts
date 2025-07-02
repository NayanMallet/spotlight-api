import puppeteer from 'puppeteer'
import { DateTime } from 'luxon'
import Event from '#events/models/event'
import { inject } from '@adonisjs/core'
import { EventType, EventSubtype } from '#events/enums/events'
import { EventsService } from '#events/services/events_service'
import { ArtistsService } from '#artists/services/artists_service'

@inject()
export class EventsScraperService {
  constructor(
    private eventsService: EventsService,
    private artistsService: ArtistsService
  ) {}

  /**
   * Creates or finds existing artists from lineup data
   * @param lineup - Array of artist data with name and image URL
   * @returns Promise<number[]> - Array of artist IDs
   */
  private async createOrFindArtists(lineup: { name: string; image: string }[]): Promise<number[]> {
    const artistIds: number[] = []

    for (const artistData of lineup) {
      try {
        const artist = await this.artistsService.createOrFindFromUrl({
          name: artistData.name,
          imageUrl: artistData.image,
        })
        artistIds.push(artist.id)
      } catch (error) {
        console.warn(`Failed to create/find artist ${artistData.name}:`, error)
      }
    }

    return artistIds
  }

  /**
   * Creates an event using EventsService (for scraper use case with URLs)
   * @param eventData - The scraped event data
   * @returns Promise<Event> - The created event
   */
  private async createEventFromScrapedData(eventData: {
    title: string
    startDate: string
    endDate: string
    address: string
    city: string
    placeName: string
    latitude: number | null
    longitude: number | null
    bannerUrl: string
    description: string
    lineup: { name: string; image: string }[]
  }): Promise<Event> {
    // Create or find artists
    const artistIds = await this.createOrFindArtists(eventData.lineup)

    // Parse date and create proper DateTime objects
    const startDateTime = DateTime.fromISO(eventData.startDate)
    const endDateTime = DateTime.fromISO(eventData.endDate)

    // Create event using EventsService
    const event = await this.eventsService.createFromUrl({
      title: eventData.title,
      description: eventData.description || null,
      startDate: startDateTime.toJSDate(),
      endDate: endDateTime.toJSDate(),
      startHour: startDateTime.toJSDate(),
      openHour: null,
      latitude: eventData.latitude || 0,
      longitude: eventData.longitude || 0,
      placeName: eventData.placeName,
      address: eventData.address,
      city: eventData.city,
      type: EventType.CONCERT, // Default to concert, could be enhanced with logic
      subtype: EventSubtype.ROCK, // Default to rock, could be enhanced with logic
      bannerUrl: eventData.bannerUrl,
      artistIds: artistIds.length > 0 ? artistIds : undefined,
    })

    return event
  }

  /**
   * Géocode address using OpenStreetMap Nominatim API
   * @param address - The address to geocode
   * @returns {Promise<{ lat: number; lng: number } | null>} - Returns latitude and longitude or null if not found
   */
  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers: {
            'User-Agent': 'EventScraperBot/1.0 (your@email.com)',
          },
        }
      )
      const data = (await response.json()) as { lat: string; lon: string }[]
      if (data && data.length > 0) {
        return {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
        }
      }
      return null
    } catch (error) {
      console.warn('Erreur lors du géocodage :', error)
      return null
    }
  }

  async fetchShotgunEvents(): Promise<Event[]> {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.goto('https://shotgun.live/fr/cities/toulouse', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    while (true) {
      const loadMoreVisible = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
          b.textContent?.toLowerCase().includes('voir plus')
        )
        if (btn) {
          ;(btn as HTMLElement).click()
          return true
        }
        return false
      })
      if (!loadMoreVisible) break
      await wait(2500)
    }

    await wait(2000)

    const rawEvents = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[data-slot="tracked-link"]'))
      return anchors
        .map((a) => {
          const title = a.querySelector('p.line-clamp-2')?.textContent?.trim() || ''
          const location = a.querySelector('.text-muted-foreground')?.textContent?.trim() || ''
          const dateTag = a.querySelector('time')
          const dateIso = dateTag?.getAttribute('datetime') || ''
          const href = a.getAttribute('href') || ''
          const url = 'https://shotgun.live' + href
          const img = a.querySelector('img')?.getAttribute('src') || ''

          return { title, date: dateIso, location, url, image: img }
        })
        .filter((e) => e.title && e.date)
    })

    const now = new Date()
    const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

    const inFourWeeks = new Date()
    inFourWeeks.setDate(inFourWeeks.getDate() + 28)
    const inFourWeeksUtc = Date.UTC(
      inFourWeeks.getUTCFullYear(),
      inFourWeeks.getUTCMonth(),
      inFourWeeks.getUTCDate()
    )

    const events = rawEvents.filter((event) => {
      const eventDate = new Date(event.date)
      const eventUtc = Date.UTC(
        eventDate.getUTCFullYear(),
        eventDate.getUTCMonth(),
        eventDate.getUTCDate()
      )
      return eventUtc >= nowUtc && eventUtc <= inFourWeeksUtc
    })

    const createdEvents: Event[] = []

    for (const event of events) {
      try {
        await page.goto(event.url, { waitUntil: 'domcontentloaded', timeout: 30000 })

        const { description, lineup, location, placeName } = await page.evaluate(() => {
          const result = {
            description: '',
            lineup: [] as { name: string; image: string }[],
            location: '',
            placeName: '',
          }

          // Description
          const aboutHeader = Array.from(document.querySelectorAll('.text-2xl')).find(
            (h) => h.textContent?.trim() === 'À propos'
          )
          if (aboutHeader) {
            const parent = aboutHeader.closest('section') || aboutHeader.parentElement
            const descDiv = parent?.querySelector('div.whitespace-pre-wrap')
            if (descDiv) {
              result.description = descDiv.textContent?.trim() || ''
            }
          }

          // Lineup
          const lineupContainer = document.querySelector('div.grid.grid-cols-3')
          if (lineupContainer) {
            const artistLinks = Array.from(
              lineupContainer.querySelectorAll('a[data-slot="tracked-link"]')
            )
            for (const a of artistLinks) {
              const nameDiv = a.querySelector('div.text-muted-foreground')
              const name = nameDiv?.textContent?.trim() || ''
              const img = a.querySelector('img')?.getAttribute('src') || ''
              if (name && img && !name.includes('abonné')) {
                result.lineup.push({ name, image: img })
              }
            }
          }

          // Adresse postale (location)
          const locationAnchor = Array.from(document.querySelectorAll('a.text-foreground')).find(
            (a) => a.href.includes('google.com/maps/search')
          )
          if (locationAnchor) {
            result.location = locationAnchor.textContent?.trim() || ''
          }

          // Place name (Poney Club, etc.)
          const placeNameAnchor = Array.from(document.querySelectorAll('div.flex.items-center.gap-4 a.text-foreground'))
            .find(a => a.textContent?.trim()?.length && a.textContent?.trim()?.length < 100)
          if (placeNameAnchor) {
            result.placeName = placeNameAnchor.textContent?.trim() || ''
          }

          return result
        })

        // Géocodage de l'adresse postale
        const coords = location ? await this.geocodeAddress(location) : null

        // Create event using the new helper method
        const createdEvent = await this.createEventFromScrapedData({
          title: event.title,
          startDate: event.date,
          endDate: event.date,
          address: location || '',
          city: 'Toulouse', // You may extract city from location if possible
          placeName: placeName || '',
          latitude: coords?.lat || null,
          longitude: coords?.lng || null,
          bannerUrl: event.image ?? '',
          description,
          lineup,
        })

        createdEvents.push(createdEvent)
        console.log(`Successfully created event: ${createdEvent.title}`)
      } catch (err) {
        console.error(`Failed to create event ${event.title}:`, err)
        // Continue with next event instead of creating incomplete data
      }
    }

    await browser.close()

    console.log(`Successfully scraped and created ${createdEvents.length} events`)
    return createdEvents
  }
}
