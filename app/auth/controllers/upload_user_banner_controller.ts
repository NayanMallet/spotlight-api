import type { HttpContext } from '@adonisjs/core/http'
import { UsersService } from '#auth/services/users_service'
import { inject } from '@adonisjs/core'

@inject()
export default class UploadUserBannerController {
  constructor(protected usersService: UsersService) {}

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
