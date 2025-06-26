import { HttpContext } from '@adonisjs/core/http'
import { createEventValidator } from '#events/validators/events'
import { EventsService } from '#events/services/events_service'

export default class CreateEventController {
  constructor(protected eventsService: EventsService) {}

  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createEventValidator)

    const banner = request.file('banner')
    if (!banner) {
      return response.badRequest({ message: 'Banner image is required' })
    }

    const event = await this.eventsService.create(payload, banner)
    return response.created(event)
  }
}
