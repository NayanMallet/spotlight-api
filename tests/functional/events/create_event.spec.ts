import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import { UserRoles } from '#auth/enums/users'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import drive from '@adonisjs/drive/services/main'
import { DateTime } from 'luxon'
import { createJpegFixture, cleanupFiles } from '../../helpers/files.js'

test.group('Events / create event', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // On intercepte les uploads de fichiers pour ne pas créer de vrais fichiers
  group.each.setup(() => {
    drive.fake()
    return () => drive.restore()
  })

  test('creates a new event as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-create-event@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const bannerPath = createJpegFixture('event-banner')

    try {
      const response = await client
        .post('/events')
        .loginAs(admin)
        .field('title', 'New Festival')
        .field('description', 'A brand new festival')
        .field('startDate', DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'))
        .field('endDate', DateTime.now().plus({ days: 12 }).toFormat('yyyy-MM-dd'))
        .field(
          'startHour',
          DateTime.now().plus({ days: 10, hours: 18 }).toFormat('yyyy-MM-dd HH:mm:ss')
        )
        .field('latitude', 43.6047)
        .field('longitude', 1.4442)
        .field('placeName', 'Place du Capitole')
        .field('address', '1 Place du Capitole')
        .field('city', 'Toulouse')
        .field('type', EventType.FESTIVAL)
        .field('subtype', EventSubtype.ROCK)
        .file('banner', bannerPath, {
          filename: 'banner.jpg',
          contentType: 'image/jpeg',
        })

      response.assertStatus(201)
      response.assertBodyContains({
        message: 'Event created successfully',
        data: {
          title: 'New Festival',
          city: 'Toulouse',
        },
      })

      const event = await Event.findByOrFail('title', 'New Festival')
      assert.equal(event.city, 'Toulouse')
    } finally {
      cleanupFiles(bannerPath)
    }
  })

  test('rejects event creation by regular user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-create-event@example.com',
      password: 'password123',
      role: UserRoles.USER,
    })

    const response = await client.post('/events').loginAs(user).json({
      title: 'Illegal Event',
    })

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Admin access required. This action is restricted to administrators only.',
    })
  })

  test('rejects missing required fields', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-fail-create@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const response = await client.post('/events').loginAs(admin).json({})

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects invalid latitude and longitude', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-invalid-geo@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const bannerPath = createJpegFixture('invalid-geo-banner')

    try {
      const response = await client
        .post('/events')
        .loginAs(admin)
        .field('title', 'Invalid Geo')
        .field('latitude', 100) // Max 90
        .field('longitude', 200) // Max 180
        .file('banner', bannerPath, {
          filename: 'banner.jpg',
          contentType: 'image/jpeg',
        })

      response.assertStatus(400)
      response.assertBodyContains({
        message: 'Validation failed',
      })
    } finally {
      cleanupFiles(bannerPath)
    }
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.post('/events').json({ title: 'No Auth' })
    response.assertStatus(401)
  })
})
