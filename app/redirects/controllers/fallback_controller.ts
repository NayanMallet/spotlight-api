import { HttpContext } from '@adonisjs/core/http'

export default class FallbackController {
  public async handle({ response }: HttpContext) {
    return response.status(404).json({
      message: 'Endpoint not found',
      code: 'E_ROUTE_NOT_FOUND',
    })
  }
}
