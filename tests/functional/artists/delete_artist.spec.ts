import { test } from '@japa/runner'
import User from '#auth/models/user'
import Artist from '#artists/models/artist'
import { UserRoles } from '#auth/enums/users'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Artists / delete artist', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('deletes an existing artist as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-delete-artist@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const artist = await Artist.create({
      name: 'Artist to Delete',
      image: 'https://example.com/delete.jpg',
    })

    const response = await client.delete(`/artists/${artist.id}`).loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Artist deleted successfully',
    })

    const deletedArtist = await Artist.find(artist.id)
    assert.isNull(deletedArtist)
  })

  test('rejects artist deletion by regular user', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-delete-artist@example.com',
      password: 'password123',
    })

    const artist = await Artist.create({
      name: 'Protected Artist',
      image: 'https://example.com/prot.jpg',
    })

    const response = await client.delete(`/artists/${artist.id}`).loginAs(user)

    response.assertStatus(403)

    const artistStillExists = await Artist.find(artist.id)
    assert.isNotNull(artistStillExists)
  })

  test('returns 404 when deleting non-existent artist', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-delete-artist-404@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const response = await client.delete('/artists/9999').loginAs(admin)

    response.assertStatus(404)
  })
})
