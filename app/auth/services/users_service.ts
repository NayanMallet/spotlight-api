import User from '#auth/models/user'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { DriveService } from '#core/services/drive_service'

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
  private readonly UPLOADS_PATH = 'uploads/users'
  private readonly ALLOWED_BANNER_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
  private readonly DEFAULT_BANNER_URL_TEMPLATE =
    'https://unavatar.io/{email}?fallback=https://avatar.vercel.sh/{fullName}?size=128'

  constructor(private driveService: DriveService) {}

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
    const bannerUrl = this.DEFAULT_BANNER_URL_TEMPLATE.replace('{email}', data.email || '').replace(
      '{fullName}',
      data.full_name || ''
    )

    return await User.create({
      ...data,
      bannerUrl,
    })
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
    const user = await this.findUserOrFail(id)

    // Update user fields
    if (data.full_name !== undefined) user.full_name = data.full_name
    if (data.email !== undefined) user.email = data.email
    if (data.password !== undefined) user.password = await hash.use('scrypt').make(data.password)

    // Handle banner update if provided
    if (banner) {
      const uploadConfig = {
        uploadsPath: this.UPLOADS_PATH,
        allowedExtensions: this.ALLOWED_BANNER_EXTENSIONS,
        entityType: 'user',
        entityId: user.id,
      }
      user.bannerUrl = await this.driveService.replaceFile(banner, uploadConfig, user.bannerUrl)
    }

    await user.save()
    return user
  }

  /**
   * Deletes a user by ID and their associated banner image.
   * @param id - The user ID.
   * @return A promise that resolves to true if deleted, false if not found.
   */
  async delete(id: number): Promise<boolean> {
    const user = await User.find(id)
    if (!user) {
      return false
    }

    const uploadConfig = {
      uploadsPath: this.UPLOADS_PATH,
      allowedExtensions: this.ALLOWED_BANNER_EXTENSIONS,
      entityType: 'user',
      entityId: id,
    }
    await this.driveService.deleteFile(user.bannerUrl, uploadConfig, id)
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

    user.password = await hash.use('scrypt').make(data.newPassword)
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
    if (!banner) {
      throw new Error('Banner image is required')
    }

    const user = await this.findUserOrFail(userId)
    const uploadConfig = {
      uploadsPath: this.UPLOADS_PATH,
      allowedExtensions: this.ALLOWED_BANNER_EXTENSIONS,
      entityType: 'user',
      entityId: user.id,
    }
    user.bannerUrl = await this.driveService.replaceFile(banner, uploadConfig, user.bannerUrl)
    await user.save()

    return user
  }

  /**
   * Links a Google account to the user.
   * @param {User} user - The user to link the account to.
   * @param {string} googleId - The unique ID from Google.
   * @returns {Promise<User>} - The updated user.
   */
  async linkGoogleAccount(user: User, googleId: string): Promise<User> {
    user.googleId = googleId
    await user.save()
    return user
  }

  /**
   * Handles Google OAuth login or registration.
   * @param {string} googleId - The unique ID from Google.
   * @param {string} email - The user's email address.
   * @param {string} fullName - The user's full name.
   * @returns {Promise<User>} - The authenticated or registered user.
   */
  async handleGoogleLoginOrRegister({
    googleId,
    email,
    fullName,
  }: {
    googleId: string
    email: string
    fullName: string
  }): Promise<User> {
    // First check if user exists with this Google ID
    let user = await User.query().where('googleId', googleId).first()

    if (user) return user

    // Check if user exists with this email
    user = await User.query().where('email', email).first()

    if (!user) {
      // Create new user with Google ID
      user = await User.create({
        full_name: fullName,
        email,
        password: Math.random().toString(36).slice(-12),
        googleId,
      })
    } else {
      // Link Google ID to existing user
      await this.linkGoogleAccount(user, googleId)
    }

    return user
  }

  /**
   * Unlinks the Google account from a user.
   * @param {User} user - The user to unlink the account from.
   * @returns {Promise<boolean>} - True if unlinked successfully, false if not found.
   */
  async unlinkGoogleAccount(user: User): Promise<boolean> {
    if (!user.googleId) {
      return false
    }

    user.googleId = null
    await user.save()
    return true
  }

  /**
   * Finds a user by ID or throws an error if not found
   * @private
   */
  private async findUserOrFail(id: number): Promise<User> {
    const user = await User.find(id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }
}
