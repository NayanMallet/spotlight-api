import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#users/validators/users'
import { UsersService } from '#users/services/users_service'
import User from '#users/models/user'

export default class LoginController {
  constructor(protected usersService: UsersService) {}

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
        name: user.name,
        email: user.email,
      },
      token,
    })
  }
}
