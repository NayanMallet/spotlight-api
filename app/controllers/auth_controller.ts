import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = request.only(['email', 'password', 'fullName'])

    const user = await User.create(data)
    // Créer le token directement via User.accessTokens
    const token = await User.accessTokens.create(user)

    return response.created({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token: token.value?.release(),
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    // Trouver l'utilisateur et vérifier le mot de passe manuellement
    const user = await User.findBy('email', email)
    
    if (!user) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    // Vérifier le mot de passe
    const isValidPassword = await hash.verify(user.password, password)
    
    if (!isValidPassword) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
    
    // Créer le token directement via User.accessTokens
    const token = await User.accessTokens.create(user)

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token: token.value?.release(),
    })
  }

  // async logout({ auth, response }: HttpContext) {
  //   const user = await auth.use('api').authenticate()
  //   await auth.use('api').logout()
    
  //   return response.ok({ message: 'Logged out successfully' })
  // }
}