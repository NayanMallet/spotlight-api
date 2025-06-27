import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#auth/validators/users'
import { UsersService } from '#auth/services/users_service'
import User from '#auth/models/user'
import { inject } from '@adonisjs/core'

@inject()
export default class LoginController {
  constructor(protected usersService: UsersService) {}

  /**
   * @swagger
   * /login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: User login
   *     description: Authenticate user with email and password
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: password123
   *     responses:
   *       200:
   *         description: Login successful
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
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid credentials
   */
  async handle({ request, response, auth }: HttpContext) {
    if (auth.user) {
      return response.status(400).json({
        message: 'You are already logged in',
      })
    }

    const { email, password } = await request.validateUsing(loginValidator)

    const user = await this.usersService.attempt(email, password)
    const token = await User.accessTokens.create(user)

    return response.ok({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      token,
    })
  }
}
