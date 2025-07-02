import type { HttpContext } from '@adonisjs/core/http'
import { UsersService } from '#auth/services/users_service'
import { inject } from '@adonisjs/core'

@inject()
export default class GetUserController {
  constructor(protected usersService: UsersService) {}

  /**
   * @get
   * @summary Get current user profile
   * @description Get the authenticated user's profile information
   * @tag Users
   * @responseBody 200 - {"message": "User retrieved successfully", "data": {"id": 1, "full_name": "John Doe", "email": "user@example.com", "bannerUrl": "https://example.com/banner.jpg", "role": "user", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}} - User retrieved successfully
   * @responseBody 401 - {"message": "Authentication required"} - Authentication required
   * @responseBody 404 - {"message": "User not found"} - User not found
   * @responseBody 500 - {"message": "An error occurred while retrieving the user", "error": "string"} - Internal server error
   */
  async handle({ response, auth }: HttpContext) {
    try {
      // Ensure user is authenticated
      if (!auth.user) {
        return response.unauthorized({
          message: 'Authentication required',
        })
      }

      const user = await this.usersService.getById(auth.user.id)

      return response.ok({
        message: 'User retrieved successfully',
        data: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          bannerUrl: user.bannerUrl,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      // Handle user not found
      if (error.message === 'User not found') {
        return response.notFound({
          message: 'User not found',
        })
      }

      // Handle other errors
      return response.internalServerError({
        message: 'An error occurred while retrieving the user',
        error: error.message,
      })
    }
  }
}
