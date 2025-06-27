import { HttpContext } from '@adonisjs/core/http'
import { createEventValidator } from '#events/validators/events'
import { EventsService } from '#events/services/events_service'
import { inject } from '@adonisjs/core'

@inject()
export default class CreateEventController {
  constructor(protected eventsService: EventsService) {}

  async handle({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createEventValidator)

      const banner = request.file('banner')
      if (!banner) {
        return response.badRequest({
          message: 'Banner image is required',
          error: 'MISSING_BANNER_FILE',
        })
      }

      const event = await this.eventsService.create(payload, banner)

      return response.created({
        message: 'Event created successfully',
        data: event,
      })
    } catch (error) {
      // Handle validation errors
      if (error.messages) {
        return response.badRequest({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      // Handle other errors
      return response.internalServerError({
        message: 'An error occurred while creating the event',
        error: error.message,
      })
    }
  }
}
