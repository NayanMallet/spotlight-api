import { HttpContext } from '@adonisjs/core/http'
import { updateEventValidator } from '#events/validators/events'
import { EventsService } from '#events/services/events_service'
import { inject } from '@adonisjs/core'

@inject()
export default class UpdateEventController {
  constructor(protected eventsService: EventsService) {}

  async handle({ request, response, params }: HttpContext) {
    try {
      const eventId = Number(params.id)

      // Validate event ID
      if (!eventId || eventId < 1) {
        return response.badRequest({
          message: 'Invalid event ID',
          error: 'INVALID_EVENT_ID',
        })
      }

      const payload = await request.validateUsing(updateEventValidator)
      const banner = request.file('banner')

      const event = await this.eventsService.update(eventId, payload, banner || undefined)

      return response.ok({
        message: 'Event updated successfully',
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

      // Handle event not found
      if (error.message === 'Event not found') {
        return response.notFound({
          message: 'Event not found',
          error: 'EVENT_NOT_FOUND',
        })
      }

      // Handle file upload errors
      if (error.message.includes('Failed to upload banner image')) {
        return response.badRequest({
          message: 'File upload failed',
          error: error.message,
        })
      }

      // Handle other errors
      return response.internalServerError({
        message: 'An error occurred while updating the event',
        error: error.message,
      })
    }
  }
}
