import type { HttpContext } from '@adonisjs/core/http'
import { updateUserValidator } from '#auth/validators/users'
import { UsersService } from '#auth/services/users_service'
import { inject } from '@adonisjs/core'

@inject()
export default class UpdateUserController {
  constructor(protected usersService: UsersService) {}

  /**
   * @update
   * @summary Update user profile
   * @description Update user profile information with optional banner image upload
   * @tag Users
   * @paramPath id - The ID of the user to update (optional, defaults to current user) - @type(number)
   * @requestFormDataBody {"full_name":{"type":"string","minLength":3,"maxLength":255},"email":{"type":"string","format":"email"},"bannerUrl":{"type":"string","format":"uri"},"banner":{"type":"string","format":"binary","description":"Optional banner image file"}}
   * @responseBody 200 - {"message": "User updated successfully", "data": {"id": 1, "full_name": "John Doe", "email": "user@example.com", "bannerUrl": "https://example.com/banner.jpg"}} - User updated successfully
   * @responseBody 400 - {"message": "Validation failed", "errors": []} - Validation errors
   * @responseBody 401 - {"message": "Authentication required"} - Authentication required
   * @responseBody 403 - {"message": "You can only update your own profile"} - Forbidden access
   * @responseBody 500 - {"message": "An error occurred while updating the user", "error": "string"} - Internal server error
   */
  async handle({ request, response, auth, params }: HttpContext) {
    try {
      // Ensure user is authenticated
      if (!auth.user) {
        return response.unauthorized({
          message: 'Authentication required',
        })
      }

      const userId = params.id ? Number.parseInt(params.id) : auth.user.id

      // Users can only update their own profile unless they're admin
      if (userId !== auth.user.id) {
        return response.forbidden({
          message: 'You can only update your own profile',
        })
      }

      const payload = await request.validateUsing(updateUserValidator)
      const banner = request.file('banner')

      const user = await this.usersService.update(userId, payload, banner || undefined)

      return response.ok({
        message: 'User updated successfully',
        data: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          bannerUrl: user.bannerUrl,
        },
      })
    } catch (error) {
      // Handle validation errors
      if (error.messages) {
        return response.badRequest({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      // Handle other errors
      return response.internalServerError({
        message: 'An error occurred while updating the user',
        error: error.message,
      })
    }
  }
}
