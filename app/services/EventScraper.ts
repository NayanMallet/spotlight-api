import puppeteer from 'puppeteer'

import EventModel from '#models/event'
import { DateTime } from 'luxon'

interface Event {
  title: string
  date: string
  location: string
  url: string
  image: string
  description: string
  lineup: { name: string, image: string }[]
}


export default class EventScraper {
  static async fetchShotgunEvents(): Promise<Event[]> {
    const browser = await puppeteer.launch({
      headless: 'new',
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
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.toLowerCase().includes('voir plus'))
        if (btn) {
          (btn as HTMLElement).click()
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
      return anchors.map(a => {
        const title = a.querySelector('p.line-clamp-2')?.textContent?.trim() || ''
        const location = a.querySelector('.text-muted-foreground')?.textContent?.trim() || ''
        const dateTag = a.querySelector('time')
        const dateIso = dateTag?.getAttribute('datetime') || ''
        const href = a.getAttribute('href') || ''
        const url = 'https://shotgun.live' + href
        const img = a.querySelector('img')?.getAttribute('src') || ''

        return { title, date: dateIso, location, url, image: img }
      }).filter(e => e.title && e.date)
    })

    const now = new Date()
    const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

    const inFourWeeks = new Date()
    inFourWeeks.setDate(inFourWeeks.getDate() + 28)
    const inFourWeeksUtc = Date.UTC(inFourWeeks.getUTCFullYear(), inFourWeeks.getUTCMonth(), inFourWeeks.getUTCDate())

    const events = rawEvents.filter(event => {
      const eventDate = new Date(event.date)
      const eventUtc = Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate())
      return eventUtc >= nowUtc && eventUtc <= inFourWeeksUtc
    })

    const detailedEvents: Event[] = []

    for (const event of events) {
      try {
        await page.goto(event.url, { waitUntil: 'domcontentloaded', timeout: 30000 })

        const { description, lineup } = await page.evaluate(() => {
          const result = { description: '', lineup: [] as { name: string, image: string }[] }

          const aboutHeader = Array.from(document.querySelectorAll('.text-2xl'))
            .find(h => h.textContent?.trim() === 'À propos')
          if (aboutHeader) {
            const parent = aboutHeader.closest('section') || aboutHeader.parentElement
            const descDiv = parent?.querySelector('div.whitespace-pre-wrap')
            if (descDiv) {
              result.description = descDiv.textContent?.trim() || ''
            }
          }

          const lineupContainer = document.querySelector('div.grid.grid-cols-3')
          if (lineupContainer) {
            const artistLinks = Array.from(lineupContainer.querySelectorAll('a[data-slot="tracked-link"]'))
            for (const a of artistLinks) {
              const nameDiv = a.querySelector('div.text-muted-foreground')
              const name = nameDiv?.textContent?.trim() || ''
              const img = a.querySelector('img')?.getAttribute('src') || ''
              if (name && img) {
                result.lineup.push({ name, image: img })
              }
            }
          }

          return result
        })




        detailedEvents.push({ ...event, description, lineup })
      } catch (err) {
        console.warn(`Erreur lors du chargement de ${event.url}:`, err)
        detailedEvents.push({ ...event, description: '', lineup: '' })
      }
    }

    await browser.close()

    for (const event of detailedEvents) {
      try {
        await EventModel.create({
          name: event.title,
          startDate: DateTime.fromISO(event.date),
          address: event.location,
          description: event.description,
          lineup: JSON.stringify(event.lineup),
          img: event.image ?? null,
        })
      } catch (err) {
        console.error(`Erreur en insérant ${event.title} :`, err)
      }
    }
    return detailedEvents
  }
}
