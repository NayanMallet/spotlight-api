import { test } from '@japa/runner'
import User from '#auth/models/user'
import Artist from '#artists/models/artist'
import { UserRoles } from '#auth/enums/users'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import { createJpegFixture, cleanupFiles } from '../../helpers/files.js'

test.group('Artists / create artist', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.setup(() => {
    drive.fake()
    return () => drive.restore()
  })

  test('creates a new artist as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-create-artist@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const imagePath = createJpegFixture('artist-image')

    try {
      const response = await client.post('/artists').loginAs(admin)
        .field('name', 'Newly Created Artist')
        .file('image', imagePath, {
          filename: 'new.jpg',
          contentType: 'image/jpeg',
        })
      response.assertStatus(201)
      response.assertBodyContains({
        message: 'Artist created successfully',
        data: {
          name: 'Newly Created Artist',
        },
      })

      const artist = await Artist.findByOrFail('name', 'Newly Created Artist')
      assert.equal(artist.name, 'Newly Created Artist')
    } finally {
      cleanupFiles(imagePath)
    }
  })

  test('rejects artist creation by regular user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-create-artist@example.com',
      password: 'password123',
    })

    const imagePath = createJpegFixture('illegal-artist-image')

    try {
      const response = await client.post('/artists').loginAs(user)
        .field('name', 'Illegal Artist')
        .file('image', imagePath, {
          filename: 'illegal.jpg',
          contentType: 'image/jpeg',
        })

      response.assertStatus(403)
    } finally {
      cleanupFiles(imagePath)
    }
  })

  test('rejects missing required fields', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-fail-artist@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const response = await client.post('/artists').loginAs(admin).json({})

    response.assertStatus(400)
  })
})
