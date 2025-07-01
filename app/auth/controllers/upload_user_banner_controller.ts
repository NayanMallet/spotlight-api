import type { HttpContext } from '@adonisjs/core/http'
import { UsersService } from '#auth/services/users_service'
import { inject } from '@adonisjs/core'

@inject()
export default class UploadUserBannerController {
  constructor(protected usersService: UsersService) {}

  /**
   * @uploadBanner
   * @summary Upload user banner image
   * @description Upload a banner image for a user profile
   * @tag Users
   * @paramPath id - The ID of the user to upload banner for - @type(number) @required
   * @requestFormDataBody {"banner":{"type":"string","format":"binary","description":"Banner image file (required)"}}
   * @responseBody 200 - {"message": "Banner uploaded successfully", "data": {"id": 1, "full_name": "John Doe", "email": "user@example.com", "bannerUrl": "https://example.com/banner.jpg"}} - Banner uploaded successfully
   * @responseBody 400 - {"message": "Banner image is required", "error": "MISSING_BANNER_FILE"} - Banner image is required
   * @responseBody 400 - {"message": "Validation failed", "errors": []} - Validation errors
   * @responseBody 401 - {"message": "Authentication required"} - Authentication required
   * @responseBody 403 - {"message": "You can only upload banner for your own profile"} - Forbidden access
   * @responseBody 500 - {"message": "An error occurred while uploading the banner", "error": "string"} - Internal server error
   */
  async handle({ request, response, auth, params }: HttpContext) {
    try {
      // Ensure user is authenticated
      if (!auth.user) {
        return response.unauthorized({
          message: 'Authentication required',
        })
      }

      const userId = params.id ? parseInt(params.id) : auth.user.id

      // Users can only upload banner for their own profile unless they're admin
      if (userId !== auth.user.id) {
        return response.forbidden({
          message: 'You can only upload banner for your own profile',
        })
      }

      const banner = request.file('banner')
      if (!banner) {
        return response.badRequest({
          message: 'Banner image is required',
          error: 'MISSING_BANNER_FILE',
        })
      }

      const user = await this.usersService.uploadBanner(userId, banner)

      return response.ok({
        message: 'Banner uploaded successfully',
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
        message: 'An error occurred while uploading the banner',
        error: error.message,
      })
    }
  }
}
