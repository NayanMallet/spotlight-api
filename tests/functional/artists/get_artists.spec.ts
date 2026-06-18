import { test } from '@japa/runner'
import User from '#auth/models/user'
import Artist from '#artists/models/artist'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Artists / get artists', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns a paginated list of artists', async ({ client }) => {
    const user = await User.create({
      full_name: 'Artist Viewer',
      email: 'artists@example.com',
      password: 'password123',
    })

    await Artist.createMany([
      { name: 'Artist 1', image: 'https://example.com/1.jpg' },
      { name: 'Artist 2', image: 'https://example.com/2.jpg' },
    ])

    const response = await client.get('/artists').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Artists retrieved successfully',
      data: {
        meta: { total: 2 },
        data: [{ name: 'Artist 1' }, { name: 'Artist 2' }],
      },
    })
  })

  test('filters artists by name', async ({ client }) => {
    const user = await User.create({
      full_name: 'Artist Searcher',
      email: 'search@example.com',
      password: 'password123',
    })

    await Artist.create({ name: 'Unique Artist', image: 'https://example.com/u.jpg' })
    await Artist.create({ name: 'Common Name', image: 'https://example.com/c.jpg' })

    const response = await client.get('/artists').qs({ name: 'Unique' }).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Artists retrieved successfully',
      data: {
        meta: { total: 1 },
        data: [{ name: 'Unique Artist' }],
      },
    })
  })
})
