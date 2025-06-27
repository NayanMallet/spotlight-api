import { HttpContext } from '@adonisjs/core/http'

export default class FallbackController {
  /**
   * @fallback
   * @summary Fallback route handler
   * @description Handles requests to undefined endpoints and returns 404 error
   * @tag System
   * @responseBody 404 - {"message": "Endpoint not found", "code": "E_ROUTE_NOT_FOUND"} - Endpoint not found
   */
  public async handle({ response }: HttpContext) {
    return response.status(404).json({
      message: 'Endpoint not found',
      code: 'E_ROUTE_NOT_FOUND',
    })
  }
}
