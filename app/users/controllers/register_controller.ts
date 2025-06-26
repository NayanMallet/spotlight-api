import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#users/validators/users'
import { UsersService } from '#users/services/users_service'
import User from '#users/models/user'

export default class RegisterController {
  constructor(protected usersService: UsersService) {}

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
        name: user.name,
        email: user.email,
      },
      token,
    })
  }
}
