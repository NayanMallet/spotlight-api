import { test } from '@japa/runner'
import User from '#auth/models/user'
import Artist from '#artists/models/artist'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Artists / get artist', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns an artist by its ID', async ({ client }) => {
    const user = await User.create({
      full_name: 'Artist Viewer',
      email: 'viewer@example.com',
      password: 'password123',
    })

    const artist = await Artist.create({
      name: 'Single Artist',
      image: 'https://example.com/single.jpg',
    })

    const response = await client.get(`/artists/${artist.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Artist retrieved successfully',
      data: {
        id: artist.id,
        name: 'Single Artist',
      },
    })
  })

  test('returns 404 when artist does not exist', async ({ client }) => {
    const user = await User.create({
      full_name: 'Artist Viewer',
      email: 'viewer404@example.com',
      password: 'password123',
    })

    const response = await client.get('/artists/9999').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Artist not found',
    })
  })
})
