import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#auth/validators/users'
import { UsersService } from '#auth/services/users_service'
import User from '#auth/models/user'
import { inject } from '@adonisjs/core'

@inject()
export default class RegisterController {
  constructor(protected usersService: UsersService) {}

  /**
   * @swagger
   * /register:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: User registration
   *     description: Register a new user account
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - full_name
   *               - email
   *               - password
   *             properties:
   *               full_name:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 255
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 8
   *                 maxLength: 255
   *                 example: password123
   *               bannerUrl:
   *                 type: string
   *                 format: uri
   *                 example: https://example.com/banner.jpg
   *                 description: Optional banner image URL
   *     responses:
   *       201:
   *         description: Registration successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     full_name:
   *                       type: string
   *                       example: John Doe
   *                     email:
   *                       type: string
   *                       example: user@example.com
   *                 token:
   *                   type: object
   *                   properties:
   *                     type:
   *                       type: string
   *                       example: bearer
   *                     value:
   *                       type: string
   *                       example: oat_1.abc123...
   *       400:
   *         description: Bad request - Already logged in or validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: You are already logged in
   *       422:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Validation failed
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       field:
   *                         type: string
   *                       message:
   *                         type: string
   */
  async handle({ request, response, auth }: HttpContext) {
    if (auth.user) {
      return response.status(400).json({
        message: 'You are already logged in',
      })
    }

    const data = await request.validateUsing(registerValidator)

    const user = await this.usersService.register(data)
    const token = await User.accessTokens.create(user)

    return response.created({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      token,
    })
  }
}
