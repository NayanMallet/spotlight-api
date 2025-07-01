import type { HttpContext } from '@adonisjs/core/http'
import { UsersService } from '#auth/services/users_service'
import User from '#auth/models/user'
import { inject } from '@adonisjs/core'

@inject()
export default class OauthController {
  constructor(protected usersService: UsersService) {}

  /**
   * @oauthRedirect
   * @summary Redirect to Google OAuth
   * @description Redirects user to Google OAuth authorization page
   * @tag Authentication
   * @responseBody 302 - Redirect to Google OAuth
   */
  async redirect({ ally, response }: HttpContext) {
    try {
      const google = ally.use('google')
      return google.redirect()
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to redirect to Google OAuth',
        error: error.message,
      })
    }
  }

  /**
   * @oauthCallback
   * @summary Handle Google OAuth callback
   * @description Handles the callback from Google OAuth and logs in or registers the user
   * @tag Authentication
   * @responseBody 200 - {"user": {"id": 1, "full_name": "John Doe", "email": "user@example.com"}, "token": {"type": "bearer", "value": "oat_1.abc123..."}} - OAuth login successful
   * @responseBody 400 - {"message": "OAuth authentication failed"} - OAuth failed
   */
  async callback({ ally, response }: HttpContext) {
    try {
      const google = ally.use('google')

      if (google.accessDenied()) {
        return response.badRequest({
          message: 'Access was denied',
        })
      }

      if (google.stateMisMatch()) {
        return response.badRequest({
          message: 'Request expired. Retry again',
        })
      }

      if (google.hasError()) {
        return response.badRequest({
          message: google.getError(),
        })
      }

      const googleUser = await google.user()

      const user = await this.usersService.handleGoogleLoginOrRegister({
        googleId: googleUser.id,
        email: googleUser.email,
        fullName: googleUser.name,
      })

      const token = await User.accessTokens.create(user)

      return response.ok({
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
        },
        token,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'OAuth authentication failed',
        error: error.message,
      })
    }
  }

  /**
   * @oauthUnlink
   * @summary Unlink Google OAuth account
   * @description Unlinks the Google OAuth account from the current user
   * @tag Authentication
   * @responseBody 200 - {"message": "Google account unlinked successfully"} - Unlink successful
   * @responseBody 400 - {"message": "No Google account linked to this user"} - No account to unlink
   * @responseBody 401 - {"message": "Authentication required"} - Not authenticated
   */
  async unlink({ response, auth }: HttpContext) {
    try {
      if (!auth.user) {
        return response.unauthorized({
          message: 'Authentication required',
        })
      }

      const success = await this.usersService.unlinkGoogleAccount(auth.user)

      if (!success) {
        return response.badRequest({
          message: 'No Google account linked to this user',
        })
      }

      return response.ok({
        message: 'Google account unlinked successfully',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to unlink Google account',
        error: error.message,
      })
    }
  }
}
