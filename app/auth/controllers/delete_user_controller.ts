import type { HttpContext } from '@adonisjs/core/http'
import { UsersService } from '#auth/services/users_service'
import User from '#auth/models/user'
import { inject } from '@adonisjs/core'

@inject()
export default class DeleteUserController {
  constructor(protected usersService: UsersService) {}

  /**
   * @destroy
   * @summary Delete user account
   * @description Delete a user account and revoke all associated tokens
   * @tag Users
   * @paramPath id - The ID of the user to delete (optional, defaults to current user) - @type(number)
   * @responseBody 200 - {"message": "User deleted successfully"} - User deleted successfully
   * @responseBody 401 - {"message": "Authentication required"} - Authentication required
   * @responseBody 403 - {"message": "You can only delete your own profile"} - Forbidden access
   * @responseBody 404 - {"message": "User not found"} - User not found
   * @responseBody 500 - {"message": "An error occurred while deleting the user", "error": "string"} - Internal server error
   */
  async handle({ response, auth, params }: HttpContext) {
    try {
      // Ensure user is authenticated
      if (!auth.user) {
        return response.unauthorized({
          message: 'Authentication required',
        })
      }

      const userId = params.id ? Number.parseInt(params.id) : auth.user.id

      // Users can only delete their own profile unless they're admin
      if (userId !== auth.user.id) {
        return response.forbidden({
          message: 'You can only delete your own profile',
        })
      }

      const deleted = await this.usersService.delete(userId)

      if (!deleted) {
        return response.notFound({
          message: 'User not found',
        })
      }

      // Revoke all tokens for the user
      const userTokens = await User.accessTokens.all(auth.user)
      for (const token of userTokens) {
        await User.accessTokens.delete(auth.user, token.identifier)
      }

      return response.ok({
        message: 'User deleted successfully',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'An error occurred while deleting the user',
        error: error.message,
      })
    }
  }
}
