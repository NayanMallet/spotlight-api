import type { HttpContext } from '@adonisjs/core/http'
import { resetPasswordValidator } from '#auth/validators/users'
import { UsersService } from '#auth/services/users_service'
import { inject } from '@adonisjs/core'

@inject()
export default class ResetPasswordController {
  constructor(protected usersService: UsersService) {}

  async handle({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(resetPasswordValidator)

      const user = await this.usersService.resetPassword(payload)

      return response.ok({
        message: 'Password reset successfully',
        data: {
          id: user.id,
          email: user.email,
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

      // Handle user not found error
      if (error.message === 'User not found') {
        return response.notFound({
          message: 'User with this email address not found',
        })
      }

      // Handle other errors
      return response.internalServerError({
        message: 'An error occurred while resetting the password',
        error: error.message,
      })
    }
  }
}
