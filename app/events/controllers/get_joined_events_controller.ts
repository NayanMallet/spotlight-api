import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { EventsService } from '#events/services/events_service'

@inject()
export default class GetJoinedEventsController {
  constructor(private eventsService: EventsService) {}

  async handle({ request, response, auth }: HttpContext): Promise<void> {
    try {
      const user = auth.getUserOrFail()
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      const events = await this.eventsService.getJoinedEvents(user.id, page, limit)

      return response.status(200).json({
        message: 'Joined events retrieved successfully',
        data: events,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to retrieve joined events',
        error: error.message,
      })
    }
  }

  async check({ params, response, auth }: HttpContext): Promise<void> {
    try {
      const user = auth.getUserOrFail()
      const eventId = params.id

      const joined = await this.eventsService.isJoined(user.id, eventId)

      return response.status(200).json({
        message: 'Join status retrieved successfully',
        data: { eventId, hasJoined: joined },
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to check join status',
        error: error.message,
      })
    }
  }
}
