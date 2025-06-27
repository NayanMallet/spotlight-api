import User from '#users/models/user'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'

export interface UpdateUserData {
  full_name?: string
  email?: string
  password?: string
}

export interface ResetPasswordData {
  email: string
  newPassword: string
}

@inject()
export class UsersService {
  /**
   * Attempts to authenticate a user with the given email and password.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<User>} - The authenticated user.
   */
  async attempt(email: string, password: string): Promise<User> {
    return await User.verifyCredentials(email, password)
  }

  /**
   * Registers a new user with the provided data.
   * @param {Partial<User>} data - The user data to register.
   * @returns {Promise<User>} - The registered user.
   */
  async register(data: Partial<User>): Promise<User> {
    // Generate default banner URL using unavatar.io with fallback to avatar.vercel.sh
    const bannerUrl = `https://unavatar.io/${data.email}?fallback=https://avatar.vercel.sh/${data.full_name}?size=128`

    const user = await User.create({
      ...data,
      bannerUrl,
    })

    return user
  }

  /**
   * Updates an existing user.
   * @param id - The user ID.
   * @param data - The updated user data.
   * @param banner - Optional new banner file.
   * @return A promise that resolves to the updated User instance.
   * @throws Error if user is not found or update fails
   */
  async update(id: number, data: UpdateUserData, banner?: MultipartFile): Promise<User> {
    const user = await User.find(id)
    if (!user) {
      throw new Error('User not found')
    }

    // Update user fields
    if (data.full_name !== undefined) user.full_name = data.full_name
    if (data.email !== undefined) user.email = data.email
    if (data.password !== undefined) user.password = await hash.make(data.password)

    // Handle banner update if provided
    if (banner) {
      // Validate file type
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
      if (!allowedExtensions.includes(banner.extname || '')) {
        throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`)
      }

      try {
        // Upload new banner file
        const fileName = `user_${user.id}_${cuid()}.${banner.extname}`

        await banner.move(app.publicPath('uploads/users'), {
          name: fileName,
          overwrite: true,
        })

        // Update user with new banner URL
        user.bannerUrl = `/uploads/users/${fileName}`
      } catch (error) {
        throw new Error(`Failed to upload banner image: ${error.message}`)
      }
    }

    await user.save()
    return user
  }

  /**
   * Deletes a user by ID.
   * @param id - The user ID.
   * @return A promise that resolves to true if deleted, false if not found.
   */
  async delete(id: number): Promise<boolean> {
    const user = await User.find(id)
    if (!user) {
      return false
    }

    await user.delete()
    return true
  }

  /**
   * Resets a user's password.
   * @param data - The reset password data containing email and new password.
   * @return A promise that resolves to the updated User instance.
   * @throws Error if user is not found
   */
  async resetPassword(data: ResetPasswordData): Promise<User> {
    const user = await User.findBy('email', data.email)
    if (!user) {
      throw new Error('User not found')
    }

    user.password = await hash.make(data.newPassword)
    await user.save()

    return user
  }

  /**
   * Uploads a banner image for a user.
   * @param userId - The user ID.
   * @param banner - The banner file to be uploaded.
   * @return A promise that resolves to the updated User instance.
   * @throws Error if user is not found or file upload fails
   */
  async uploadBanner(userId: number, banner: MultipartFile): Promise<User> {
    const user = await User.find(userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (!banner) {
      throw new Error('Banner image is required')
    }

    // Validate file type
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowedExtensions.includes(banner.extname || '')) {
      throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`)
    }

    try {
      // Upload banner file
      const fileName = `user_${user.id}_${cuid()}.${banner.extname}`

      await banner.move(app.publicPath('uploads/users'), {
        name: fileName,
        overwrite: true,
      })

      // Update user with banner URL
      user.bannerUrl = `/uploads/users/${fileName}`
      await user.save()

      return user
    } catch (error) {
      throw new Error(`Failed to upload banner image: ${error.message}`)
    }
  }
}
