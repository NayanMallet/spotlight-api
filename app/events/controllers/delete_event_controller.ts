import { HttpContext } from '@adonisjs/core/http'
import { EventsService } from '#events/services/events_service'
import { inject } from '@adonisjs/core'

@inject()
export default class DeleteEventController {
  constructor(protected eventsService: EventsService) {}

  async handle({ response, params }: HttpContext) {
    try {
      const eventId = Number(params.id)

      // Validate event ID
      if (!eventId || eventId < 1) {
        return response.badRequest({
          message: 'Invalid event ID',
          error: 'INVALID_EVENT_ID',
        })
      }

      const deleted = await this.eventsService.delete(eventId)

      if (!deleted) {
        return response.notFound({
          message: 'Event not found',
          error: 'EVENT_NOT_FOUND',
        })
      }

      return response.ok({
        message: 'Event deleted successfully',
        data: {
          id: eventId,
          deleted: true,
        },
      })
    } catch (error) {
      // Handle other errors
      return response.internalServerError({
        message: 'An error occurred while deleting the event',
        error: error.message,
      })
    }
  }
}
