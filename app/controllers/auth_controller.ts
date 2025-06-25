import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = request.only(['email', 'password', 'fullName'])

    const user = await User.create(data)
    const token = await User.accessTokens.create(user)

    return response.created({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    })
  }

  async login({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await auth.use('web').verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    })
  }
}
