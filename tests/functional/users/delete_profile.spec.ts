import { test } from '@japa/runner'
import User from '#auth/models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserRoles } from '#auth/enums/users'

test.group('Users / delete profile', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('deletes the authenticated user profile', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Delete User',
      email: 'delete-profile@example.com',
      password: 'password123',
    })

    const response = await client.delete('/users/me').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'User deleted successfully',
    })

    const deletedUser = await User.find(user.id)
    assert.isNull(deletedUser)
  })

  test('allows an admin to delete another user through the admin route', async ({
    client,
    assert,
  }) => {
    const admin = await User.create({
      full_name: 'Admin Delete User',
      email: 'admin-delete-profile@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })
    const user = await User.create({
      full_name: 'Managed Delete User',
      email: 'managed-delete-profile@example.com',
      password: 'password123',
    })

    const response = await client.delete(`/users/${user.id}`).loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'User deleted successfully',
    })

    const deletedUser = await User.find(user.id)
    assert.isNull(deletedUser)
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.delete('/users/me')

    response.assertStatus(401)
  })

  test('requires admin access to delete another user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular Delete User',
      email: 'regular-delete-profile@example.com',
      password: 'password123',
    })
    const otherUser = await User.create({
      full_name: 'Other Delete User',
      email: 'other-delete-profile@example.com',
      password: 'password123',
    })

    const response = await client.delete(`/users/${otherUser.id}`).loginAs(user)

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Admin access required. This action is restricted to administrators only.',
    })
  })

  test('returns not found when an admin deletes a missing user', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin Missing Delete',
      email: 'admin-missing-delete@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const response = await client.delete('/users/999999').loginAs(admin)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'User not found',
    })
  })
})
