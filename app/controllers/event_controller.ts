import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class AuthController {
    async get({ response }: HttpContext) {
        try {
            const events = await Event.query()
            return response.ok(events)
        } catch (error) {
            return response.internalServerError({ message: 'Failed to fetch events', error: error.message })
        }
    }
}