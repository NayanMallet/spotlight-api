import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#auth/validators/users'
import { UsersService } from '#auth/services/users_service'
import User from '#auth/models/user'
import { inject } from '@adonisjs/core'

@inject()
export default class RegisterController {
  constructor(protected usersService: UsersService) {}

  /**
   * @register
   * @summary User registration
   * @description Register a new user account
   * @tag Authentication
   * @requestBody {"full_name": {"type": "string", "minLength": 3, "maxLength": 255, "example": "John Doe"}, "email": {"type": "string", "format": "email", "example": "user@example.com"}, "password": {"type": "string", "format": "password", "minLength": 8, "maxLength": 255, "example": "password123"}, "bannerUrl": {"type": "string", "format": "uri", "example": "https://example.com/banner.jpg"}}
   * @responseBody 201 - {"user": {"id": 1, "full_name": "John Doe", "email": "user@example.com"}, "token": {"type": "bearer", "value": "oat_1.abc123..."}} - Registration successful
   * @responseBody 400 - {"message": "You are already logged in"} - Already logged in
   * @responseBody 422 - {"message": "Validation failed", "errors": []} - Validation error
   */
  async handle({ request, response, auth }: HttpContext) {
    if (auth.user) {
      return response.status(400).json({
        message: 'You are already logged in',
      })
    }

    const data = await request.validateUsing(registerValidator)

    const user = await this.usersService.register(data)
    const token = await User.accessTokens.create(user)

    return response.created({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      token,
    })
  }
}
