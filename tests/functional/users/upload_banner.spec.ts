import { test } from '@japa/runner'
import User from '#auth/models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import Drive from '@adonisjs/drive/services/main'
import { UserRoles } from '#auth/enums/users'
import {
  cleanupFiles,
  createJpegFixture,
  createLargeJpegFixture,
  createTextFixture,
  publicUploadPath,
} from '../../helpers/files.js'

test.group('Users / upload banner', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    Drive.fake()
    return () => Drive.restore()
  })

  test('uploads a banner for the authenticated user', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Banner User',
      email: 'banner-user@example.com',
      password: 'password123',
    })
    const bannerPath = createJpegFixture('user-banner')
    let uploadedPath: string | null = null

    try {
      const response = await client
        .post(`/users/${user.id}/banner`)
        .loginAs(user)
        .file('banner', bannerPath, { filename: 'banner.jpg', contentType: 'image/jpeg' })

      response.assertStatus(200)
      response.assertBodyContains({
        message: 'Banner uploaded successfully',
        data: {
          id: user.id,
          email: 'banner-user@example.com',
        },
      })

      await user.refresh()
      assert.match(user.bannerUrl!, new RegExp(`^/uploads/users/user_${user.id}_.+\\.jpg$`))
      uploadedPath = publicUploadPath(user.bannerUrl)
    } finally {
      cleanupFiles(bannerPath, uploadedPath)
    }
  })

  test('allows an admin to upload a banner for another user', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin Banner User',
      email: 'admin-banner-user@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })
    const user = await User.create({
      full_name: 'Managed Banner User',
      email: 'managed-banner-user@example.com',
      password: 'password123',
    })
    const bannerPath = createJpegFixture('admin-user-banner')
    let uploadedPath: string | null = null

    try {
      const response = await client
        .post(`/users/${user.id}/banner`)
        .loginAs(admin)
        .file('banner', bannerPath, { filename: 'banner.jpg', contentType: 'image/jpeg' })

      response.assertStatus(200)
      response.assertBodyContains({
        message: 'Banner uploaded successfully',
        data: {
          id: user.id,
          email: 'managed-banner-user@example.com',
        },
      })

      await user.refresh()
      assert.match(user.bannerUrl!, new RegExp(`^/uploads/users/user_${user.id}_.+\\.jpg$`))
      uploadedPath = publicUploadPath(user.bannerUrl)
    } finally {
      cleanupFiles(bannerPath, uploadedPath)
    }
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.post('/users/1/banner')

    response.assertStatus(401)
  })

  test('requires admin access to upload a banner for another user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular Banner User',
      email: 'regular-banner-user@example.com',
      password: 'password123',
    })
    const otherUser = await User.create({
      full_name: 'Other Banner User',
      email: 'other-banner-user@example.com',
      password: 'password123',
    })
    const bannerPath = createJpegFixture('forbidden-user-banner')

    try {
      const response = await client
        .post(`/users/${otherUser.id}/banner`)
        .loginAs(user)
        .file('banner', bannerPath, { filename: 'banner.jpg', contentType: 'image/jpeg' })

      response.assertStatus(403)
      response.assertBodyContains({
        message: 'You can only upload banner for your own profile',
      })
    } finally {
      cleanupFiles(bannerPath)
    }
  })

  test('returns not found when an admin uploads a banner for a missing user', async ({
    client,
  }) => {
    const admin = await User.create({
      full_name: 'Admin Missing Banner',
      email: 'admin-missing-banner@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })
    const bannerPath = createJpegFixture('missing-user-banner')

    try {
      const response = await client
        .post('/users/999999/banner')
        .loginAs(admin)
        .file('banner', bannerPath, { filename: 'banner.jpg', contentType: 'image/jpeg' })

      response.assertStatus(404)
      response.assertBodyContains({
        message: 'User not found',
      })
    } finally {
      cleanupFiles(bannerPath)
    }
  })

  test('rejects requests without a banner file', async ({ client }) => {
    const user = await User.create({
      full_name: 'Missing Banner User',
      email: 'missing-banner-user@example.com',
      password: 'password123',
    })

    const response = await client.post(`/users/${user.id}/banner`).loginAs(user)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Banner image is required',
      error: 'MISSING_BANNER_FILE',
    })
  })

  test('rejects invalid banner file types', async ({ client }) => {
    const user = await User.create({
      full_name: 'Invalid Banner User',
      email: 'invalid-banner-user@example.com',
      password: 'password123',
    })
    const bannerPath = createTextFixture('invalid-user-banner')

    try {
      const response = await client
        .post(`/users/${user.id}/banner`)
        .loginAs(user)
        .file('banner', bannerPath, { filename: 'banner.txt', contentType: 'text/plain' })

      response.assertStatus(400)
      response.assertBodyContains({
        message: 'Validation failed',
      })
    } finally {
      cleanupFiles(bannerPath)
    }
  })

  test('rejects banner files over the configured size limit', async ({ client }) => {
    const user = await User.create({
      full_name: 'Large Banner User',
      email: 'large-banner-user@example.com',
      password: 'password123',
    })
    const bannerPath = createLargeJpegFixture('large-user-banner')

    try {
      const response = await client
        .post(`/users/${user.id}/banner`)
        .loginAs(user)
        .file('banner', bannerPath, { filename: 'banner.jpg', contentType: 'image/jpeg' })

      response.assertStatus(400)
      response.assertBodyContains({
        message: 'Validation failed',
      })
    } finally {
      cleanupFiles(bannerPath)
    }
  })
})
