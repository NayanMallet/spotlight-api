import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { EventsService } from '#events/services/events_service'

@inject()
export default class JoinEventController {
  constructor(private eventsService: EventsService) {}

  async handle({ params, response, auth }: HttpContext): Promise<void> {
    try {
      const user = auth.getUserOrFail()
      const eventId = params.id

      const eventUser = await this.eventsService.joinEvent(user.id, eventId)

      return response.status(200).json({
        message: 'Event joined successfully',
        data: eventUser,
      })
    } catch (error) {
      if (error.message === 'Event not found' || error.message === 'User not found') {
        return response.status(404).json({
          message: error.message,
        })
      }

      return response.status(500).json({
        message: 'Failed to join event',
        error: error.message,
      })
    }
  }
}
