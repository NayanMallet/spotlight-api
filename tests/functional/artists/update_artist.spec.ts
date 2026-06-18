import { test } from '@japa/runner'
import User from '#auth/models/user'
import Artist from '#artists/models/artist'
import { UserRoles } from '#auth/enums/users'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Artists / update artist', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('updates an existing artist as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-update-artist@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const artist = await Artist.create({
      name: 'Old Artist Name',
      image: 'https://example.com/old.jpg',
    })

    const response = await client.put(`/artists/${artist.id}`).loginAs(admin).json({
      name: 'New Artist Name',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Artist updated successfully',
      data: {
        id: artist.id,
        name: 'New Artist Name',
      },
    })

    await artist.refresh()
    assert.equal(artist.name, 'New Artist Name')
  })

  test('rejects artist update by regular user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-update-artist@example.com',
      password: 'password123',
    })

    const artist = await Artist.create({
      name: 'Protected Artist',
      image: 'https://example.com/prot.jpg',
    })

    const response = await client.put(`/artists/${artist.id}`).loginAs(user).json({
      name: 'Hacked Artist',
    })

    response.assertStatus(403)
  })

  test('returns 404 when updating non-existent artist', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-update-artist-404@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const response = await client.put('/artists/9999').loginAs(admin).json({
      name: 'Missing Artist',
    })

    response.assertStatus(404)
  })
})
