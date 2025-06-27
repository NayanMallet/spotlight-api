import { HttpContext } from '@adonisjs/core/http'
import { eventIdValidator } from '#events/validators/events'
import { EventsService } from '#events/services/events_service'
import { inject } from '@adonisjs/core'

@inject()
export default class GetEventController {
  constructor(protected eventsService: EventsService) {}

  /**
   * @show
   * @summary Get a single event by ID
   * @description Retrieve detailed information about a specific event
   * @tag Events
   * @paramPath id - The ID of the event to retrieve - @type(number) @required
   * @responseBody 200 - <Event> - Event retrieved successfully
   * @responseBody 400 - {"message": "Validation failed", "errors": []} - Validation errors
   * @responseBody 404 - {"message": "Event not found", "error": "EVENT_NOT_FOUND"} - Event not found
   * @responseBody 500 - {"message": "An error occurred while retrieving the event", "error": "string"} - Internal server error
   */
  async handle({ request, response }: HttpContext) {
    try {
      const { id } = await request.validateUsing(eventIdValidator)

      const event = await this.eventsService.getById(id)

      if (!event) {
        return response.notFound({
          message: 'Event not found',
          error: 'EVENT_NOT_FOUND',
        })
      }

      return response.ok({
        message: 'Event retrieved successfully',
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
        message: 'An error occurred while retrieving the event',
        error: error.message,
      })
    }
  }
}
