import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserRoles } from '#auth/enums/users'
import Drive from '@adonisjs/drive/services/main'
import { EventType, EventSubtype } from '#events/enums/events'
import { DateTime } from 'luxon'
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

test.group('Functional API Tests', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => Drive.fake())

  /*
  |--------------------------------------------------------------------------
  | Auth Tests
  |--------------------------------------------------------------------------
  */
  test('login with valid credentials', async ({ client }) => {
    await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    const response = await client.post('/login').json({
      email: 'test@example.com',
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      user: { email: 'test@example.com' },
    })
  })

  test('login with invalid credentials', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'test@example.com',
      password: 'wrong_password',
    })

    response.assertStatus(401)
  })

  /*
  |--------------------------------------------------------------------------
  | Events Tests
  |--------------------------------------------------------------------------
  */
  test('get all events (paginated)', async ({ client }) => {
    const user = await User.create({
      full_name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
    })

    const response = await client.get('/events').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully',
    })
  })

  test('create an event (admin only)', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const tmpDir = app.tmpPath()
    const tmpFilePath = join(tmpDir, 'test-banner.jpg')
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })
    writeFileSync(tmpFilePath, Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]))

    const startDate = DateTime.now().plus({ days: 10 }).toISODate()!
    const endDate = DateTime.now().plus({ days: 11 }).toISODate()!
    const startHour = DateTime.now().plus({ days: 10, hours: 20 }).toFormat('yyyy-MM-dd HH:mm:ss')

    try {
      const response = await client
        .post('/events')
        .loginAs(admin)
        .fields({
          title: 'New Festival',
          description: 'Big festival',
          startDate,
          endDate,
          startHour,
          latitude: 43.6047,
          longitude: 1.4442,
          placeName: 'Stadium',
          address: '123 Main St',
          city: 'Toulouse',
          type: EventType.FESTIVAL,
          subtype: EventSubtype.TECHNO,
        })
        .file('banner', tmpFilePath, { filename: 'banner.jpg', contentType: 'image/jpeg' })

      response.assertStatus(201)
      response.assertBodyContains({ data: { title: 'New Festival' } })
    } finally {
      if (existsSync(tmpFilePath)) unlinkSync(tmpFilePath)
    }
  })

  /*
  |--------------------------------------------------------------------------
  | Artists Tests
  |--------------------------------------------------------------------------
  */
  test('get all artists', async ({ client }) => {
    const user = await User.create({
      full_name: 'Test User',
      email: 'artist_test@example.com',
      password: 'password123',
    })

    const response = await client.get('/artists').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Artists retrieved successfully',
    })
  })

  /*
  |--------------------------------------------------------------------------
  | Messages Tests
  |--------------------------------------------------------------------------
  */
  test('get messages for an event', async ({ client }) => {
    const user = await User.create({
      full_name: 'Test User',
      email: 'msg_test@example.com',
      password: 'password123',
    })

    // Create a dummy event to get messages from
    const event = await Event.create({
      title: 'Message Event',
      startDate: DateTime.now(),
      endDate: DateTime.now(),
      startHour: DateTime.now(),
      latitude: 0,
      longitude: 0,
      placeName: 'Place',
      address: 'Addr',
      city: 'City',
      type: EventType.CONCERT,
      subtype: EventSubtype.ROCK,
    })

    const response = await client.get(`/events/${event.id}/messages`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Messages retrieved successfully',
    })
  })
})
