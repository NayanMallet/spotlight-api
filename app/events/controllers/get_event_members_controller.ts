import { HttpContext } from '@adonisjs/core/http'
import { eventIdValidator } from '#events/validators/events'
import { EventsService } from '#events/services/events_service'
import { inject } from '@adonisjs/core'

@inject()
export default class GetEventMembersController {
  constructor(protected eventsService: EventsService) {}

  /**
   * @index
   * @summary Get event member count
   * @description Returns total number of users who joined a specific event
   * @tag Events
   * @paramPath id - Event ID - @type(number) @required
   * @responseBody 200 - {"message": "string", "data": {"total": 0}} - Member count retrieved
   * @responseBody 400 - {"message": "Validation failed", "errors": []} - Validation errors
   * @responseBody 500 - {"message": "string", "error": "string"} - Internal server error
   */
  async handle({ request, response, params }: HttpContext): Promise<void> {
    try {
      const { id: eventId } = await request.validateUsing(eventIdValidator, { data: params })

      const total = await this.eventsService.getMemberCount(eventId)

      return response.ok({
        message: 'Member count retrieved successfully',
        data: { total },
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({ message: 'Validation failed', errors: error.messages })
      }
      return response.internalServerError({
        message: 'An error occurred while retrieving member count',
        error: error.message,
      })
    }
  }
}
