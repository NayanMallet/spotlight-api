import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#auth/validators/users'
import { UsersService } from '#auth/services/users_service'
import User from '#auth/models/user'
import { inject } from '@adonisjs/core'

@inject()
export default class LoginController {
  constructor(protected usersService: UsersService) {}

  /**
   * @login
   * @summary User login
   * @description Authenticate user with email and password
   * @tag Authentication
   * @requestBody {"email": {"type": "string", "format": "email", "example": "user@example.com"}, "password": {"type": "string", "format": "password", "example": "password123"}}
   * @responseBody 200 - {"user": {"id": 1, "full_name": "John Doe", "email": "user@example.com"}, "token": {"type": "bearer", "value": "oat_1.abc123..."}} - Login successful
   * @responseBody 400 - {"message": "You are already logged in"} - Already logged in
   * @responseBody 401 - {"message": "Invalid credentials"} - Invalid credentials
   */
  async handle({ request, response, auth }: HttpContext) {
    if (auth.user) {
      return response.status(400).json({
        message: 'You are already logged in',
      })
    }

    const { email, password } = await request.validateUsing(loginValidator)

    const user = await this.usersService.attempt(email, password)
    const token = await User.accessTokens.create(user)

    return response.ok({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      token,
    })
  }
}
