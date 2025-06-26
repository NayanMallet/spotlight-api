import User from '#users/models/user'
import { inject } from '@adonisjs/core'

@inject()
export class UsersService {
  /**
   * Attempts to authenticate a user with the given email and password.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<User>} - The authenticated user.
   */
  async attempt(email: string, password: string): Promise<User> {
    return await User.verifyCredentials(email, password)
  }

  /**
   * Registers a new user with the provided data.
   * @param {Partial<User>} data - The user data to register.
   * @returns {Promise<User>} - The registered user.
   */
  async register(data: Partial<User>): Promise<User> {
    const user = await User.create(data)

    return user
  }
}
