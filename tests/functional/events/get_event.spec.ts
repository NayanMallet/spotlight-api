import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Events / get event', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns an event by its ID', async ({ client }) => {
    const user = await User.create({
      full_name: 'Show User',
      email: 'show@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Solo Show',
      description: 'A great solo show',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      startHour: DateTime.now().plus({ days: 1 }),
      latitude: 43.6047,
      longitude: 1.4442,
      placeName: 'Le Bikini',
      address: 'Rue Théodore Lenôtre',
      city: 'Toulouse',
      type: EventType.CONCERT,
      subtype: EventSubtype.ROCK,
    })

    const response = await client.get(`/events/${event.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: event.id,
        title: 'Solo Show',
      },
    })
  })

  test('returns 404 when event does not exist', async ({ client }) => {
    const user = await User.create({
      full_name: 'Show User 404',
      email: 'show404@example.com',
      password: 'password123',
    })

    const response = await client.get('/events/9999').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Event not found',
    })
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/events/1')
    response.assertStatus(401)
  })
})
