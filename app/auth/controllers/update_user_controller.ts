import type { HttpContext } from '@adonisjs/core/http'
import { updateUserValidator } from '#auth/validators/users'
import { UsersService } from '#auth/services/users_service'
import { inject } from '@adonisjs/core'

@inject()
export default class UpdateUserController {
  constructor(protected usersService: UsersService) {}

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
