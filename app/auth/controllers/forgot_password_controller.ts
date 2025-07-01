import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { UsersService } from '#auth/services/users_service'

@inject()
export default class ForgotPasswordController {
  constructor(private usersService: UsersService) {}

  /**
   * @forgotPassword
   * @summary Request password reset
   * @description Sends a password reset link to the user's email
   * @tag Authentication
   * @requestBody {"email": {"type": "string", "format": "email", "example": "user@example.com"}}
   * @responseBody 200 - {"message": "Password reset link sent successfully", "data": {"id": 1, "email": "user@example.com"}} - Reset link sent
   * @responseBody 404 - {"message": "User with this email address not found"} - User not found
   * @responseBody 500 - {"message": "An error occurred while sending the password reset link", "error": "..."} - Server error
   */
  async handle({ request, response }: HttpContext) {
    const email = request.input('email')

    try {
      const user = await this.usersService.sendPasswordReset(email)

      if (!user) {
        return response.notFound({
          message: 'User with this email address not found',
        })
      }

      return response.ok({
        message: 'Password reset link sent successfully',
        data: {
          id: user.id,
          email: user.email,
        },
      })
    } catch (error) {
      return response.internalServerError({
        message: 'An error occurred while sending the password reset link',
        error: error.message,
      })
    }
  }
}
