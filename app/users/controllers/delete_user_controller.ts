import type { HttpContext } from '@adonisjs/core/http'
import { UsersService } from '#users/services/users_service'
import { inject } from '@adonisjs/core'

@inject()
export default class DeleteUserController {
  constructor(protected usersService: UsersService) {}

  async handle({ response, auth, params }: HttpContext) {
    try {
      // Ensure user is authenticated
      if (!auth.user) {
        return response.unauthorized({
          message: 'Authentication required',
        })
      }

      const userId = params.id ? parseInt(params.id) : auth.user.id

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
      await auth.user.currentAccessToken.delete()

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
