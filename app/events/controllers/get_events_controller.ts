import { HttpContext } from '@adonisjs/core/http'
import { getEventsValidator } from '#events/validators/events'
import { EventsService } from '#events/services/events_service'
import { inject } from '@adonisjs/core'

@inject()
export default class GetEventsController {
  constructor(protected eventsService: EventsService) {}

  /**
   * @swagger
   * /events:
   *   get:
   *     tags:
   *       - Events
   *     summary: Get all events
   *     description: Retrieve a paginated list of events with optional filtering
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of events per page
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [concert, festival, exhibition, conference]
   *         description: Filter by event type
   *       - in: query
   *         name: subtype
   *         schema:
   *           type: string
   *           enum: [rock, hiphop, jazz, techno, classical]
   *         description: Filter by event subtype
   *       - in: query
   *         name: city
   *         schema:
   *           type: string
   *           minLength: 2
   *           maxLength: 100
   *         description: Filter by city name
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-01-01"
   *         description: Filter events starting from this date (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *           example: "2024-12-31"
   *         description: Filter events ending before this date (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Events retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Events retrieved successfully
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       title:
   *                         type: string
   *                         example: Summer Music Festival
   *                       description:
   *                         type: string
   *                         example: A great music festival
   *                       startDate:
   *                         type: string
   *                         format: date
   *                         example: "2024-07-15"
   *                       endDate:
   *                         type: string
   *                         format: date
   *                         example: "2024-07-17"
   *                       startHour:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-07-15T18:00:00Z"
   *                       openHour:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-07-15T17:00:00Z"
   *                       latitude:
   *                         type: number
   *                         example: 40.7128
   *                       longitude:
   *                         type: number
   *                         example: -74.0060
   *                       placeName:
   *                         type: string
   *                         example: Central Park
   *                       address:
   *                         type: string
   *                         example: 1234 Main St
   *                       city:
   *                         type: string
   *                         example: New York
   *                       type:
   *                         type: string
   *                         enum: [concert, festival, exhibition, conference]
   *                         example: festival
   *                       subtype:
   *                         type: string
   *                         enum: [rock, hiphop, jazz, techno, classical]
   *                         example: rock
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 100
   *                     perPage:
   *                       type: integer
   *                       example: 10
   *                     currentPage:
   *                       type: integer
   *                       example: 1
   *                     lastPage:
   *                       type: integer
   *                       example: 10
   *                     firstPage:
   *                       type: integer
   *                       example: 1
   *                     hasPages:
   *                       type: boolean
   *                       example: true
   *                     hasMorePages:
   *                       type: boolean
   *                       example: true
   *                     isEmpty:
   *                       type: boolean
   *                       example: false
   *       400:
   *         description: Bad request - Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Validation failed
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: An error occurred while retrieving events
   *                 error:
   *                   type: string
   */
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
