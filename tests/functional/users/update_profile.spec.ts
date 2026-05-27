import { test } from '@japa/runner'
import User from '#auth/models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import Drive from '@adonisjs/drive/services/main'
import { UserRoles } from '#auth/enums/users'
import {
  cleanupFiles,
  createJpegFixture,
  createTextFixture,
  publicUploadPath,
} from '../../helpers/files.js'

test.group('Users / update profile', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    Drive.fake()
    return () => Drive.restore()
  })

  test('updates the authenticated user profile', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Old Profile',
      email: 'old-profile@example.com',
      password: 'password123',
    })

    const response = await client.put('/users/me').loginAs(user).json({
      full_name: 'New Profile',
      email: 'new-profile@example.com',
      password: 'new-password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'User updated successfully',
      data: {
        id: user.id,
        full_name: 'New Profile',
        email: 'new-profile@example.com',
      },
    })

    await user.refresh()
    assert.equal(user.full_name, 'New Profile')
    assert.equal(user.email, 'new-profile@example.com')

    const verifiedUser = await User.verifyCredentials('new-profile@example.com', 'new-password123')
    assert.equal(verifiedUser.id, user.id)
  })

  test('updates the authenticated user banner through profile update', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Banner Profile',
      email: 'banner-profile@example.com',
      password: 'password123',
    })
    const bannerPath = createJpegFixture('profile-banner')
    let uploadedPath: string | null = null

    try {
      const response = await client
        .put('/users/me')
        .loginAs(user)
        .fields({ full_name: 'Banner Profile Updated' })
        .file('banner', bannerPath, { filename: 'banner.jpg', contentType: 'image/jpeg' })

      response.assertStatus(200)
      response.assertBodyContains({
        message: 'User updated successfully',
        data: {
          id: user.id,
          full_name: 'Banner Profile Updated',
        },
      })

      await user.refresh()
      assert.equal(user.full_name, 'Banner Profile Updated')
      assert.match(user.bannerUrl!, new RegExp(`^/uploads/users/user_${user.id}_.+\\.jpg$`))
      uploadedPath = publicUploadPath(user.bannerUrl)
    } finally {
      cleanupFiles(bannerPath, uploadedPath)
    }
  })

  test('allows an admin to update another user through the admin route', async ({
    client,
    assert,
  }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-update-profile@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })
    const user = await User.create({
      full_name: 'Managed User',
      email: 'managed-update-profile@example.com',
      password: 'password123',
    })

    const response = await client.put(`/users/${user.id}`).loginAs(admin).json({
      full_name: 'Managed User Updated',
      email: 'managed-updated@example.com',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'User updated successfully',
      data: {
        id: user.id,
        full_name: 'Managed User Updated',
        email: 'managed-updated@example.com',
      },
    })

    await user.refresh()
    assert.equal(user.full_name, 'Managed User Updated')
    assert.equal(user.email, 'managed-updated@example.com')
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.put('/users/me').json({
      full_name: 'Unauthenticated Update',
    })

    response.assertStatus(401)
  })

  test('requires admin access to update another user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'regular-update-profile@example.com',
      password: 'password123',
    })
    const otherUser = await User.create({
      full_name: 'Other User',
      email: 'other-update-profile@example.com',
      password: 'password123',
    })

    const response = await client.put(`/users/${otherUser.id}`).loginAs(user).json({
      full_name: 'Forbidden Update',
    })

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Admin access required. This action is restricted to administrators only.',
    })
  })

  test('returns not found when an admin updates a missing user', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin Missing Update',
      email: 'admin-missing-update@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const response = await client.put('/users/999999').loginAs(admin).json({
      full_name: 'Missing User',
    })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'User not found',
    })
  })

  test('rejects invalid update payloads', async ({ client }) => {
    const user = await User.create({
      full_name: 'Invalid Update',
      email: 'invalid-update@example.com',
      password: 'password123',
    })

    const invalidEmail = await client.put('/users/me').loginAs(user).json({
      email: 'not-an-email',
    })

    invalidEmail.assertStatus(400)
    invalidEmail.assertBodyContains({
      message: 'Validation failed',
    })

    const shortName = await client.put('/users/me').loginAs(user).json({
      full_name: 'Al',
    })

    shortName.assertStatus(400)
    shortName.assertBodyContains({
      message: 'Validation failed',
    })

    const longPassword = await client.put('/users/me').loginAs(user).json({
      password: 'x'.repeat(256),
    })

    longPassword.assertStatus(400)
    longPassword.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects an invalid banner file type during profile update', async ({ client }) => {
    const user = await User.create({
      full_name: 'Invalid Banner',
      email: 'invalid-banner-update@example.com',
      password: 'password123',
    })
    const bannerPath = createTextFixture('profile-banner')

    try {
      const response = await client
        .put('/users/me')
        .loginAs(user)
        .fields({ full_name: 'Invalid Banner' })
        .file('banner', bannerPath, { filename: 'banner.txt', contentType: 'text/plain' })

      response.assertStatus(400)
      response.assertBodyContains({
        message: 'Validation failed',
      })
    } finally {
      cleanupFiles(bannerPath)
    }
  })
})
