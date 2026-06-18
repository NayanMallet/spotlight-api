import { test } from '@japa/runner'
import User from '#auth/models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Users / get profile', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns the authenticated user profile', async ({ client }) => {
    const user = await User.create({
      full_name: 'Profile User',
      email: 'profile@example.com',
      password: 'password123',
      bannerUrl: 'https://example.com/profile-banner.jpg',
    })

    const response = await client.get('/users/me').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'User retrieved successfully',
      data: {
        id: user.id,
        full_name: 'Profile User',
        email: 'profile@example.com',
        bannerUrl: 'https://example.com/profile-banner.jpg',
      },
    })
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/users/me')

    response.assertStatus(401)
  })
})
