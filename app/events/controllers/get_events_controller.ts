import { HttpContext } from '@adonisjs/core/http'
import { getEventsValidator } from '#events/validators/events'
import { EventsService } from '#events/services/events_service'
import { inject } from '@adonisjs/core'

@inject()
export default class GetEventsController {
  constructor(protected eventsService: EventsService) {}

  async handle({ request, response }: HttpContext) {
    try {
      const queryParams = await request.validateUsing(getEventsValidator)

      const events = await this.eventsService.getAll(queryParams)

      return response.ok({
        message: 'Events retrieved successfully',
        data: events.all(),
        meta: {
          total: events.total,
          perPage: events.perPage,
          currentPage: events.currentPage,
          lastPage: events.lastPage,
          firstPage: events.firstPage,
          hasPages: events.hasPages,
          hasMorePages: events.hasMorePages,
          isEmpty: events.isEmpty,
        },
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
        message: 'An error occurred while retrieving events',
        error: error.message,
      })
    }
  }
}
