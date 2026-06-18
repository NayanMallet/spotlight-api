import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import Message from '#messages/models/message'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Messages / get messages', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns a paginated list of messages for an event', async ({ client }) => {
    const user = await User.create({
      full_name: 'Viewer',
      email: 'viewer@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Event with Messages',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      startHour: DateTime.now().plus({ days: 1 }),
      latitude: 43.6047,
      longitude: 1.4442,
      placeName: 'Place',
      address: 'Address',
      city: 'City',
      type: EventType.CONCERT,
      subtype: EventSubtype.ROCK,
    })

    await Message.createMany([
      { eventId: event.id.toString(), userId: user.id, content: 'Message 1' },
      { eventId: event.id.toString(), userId: user.id, content: 'Message 2' },
    ])

    const response = await client.get(`/events/${event.id}/messages`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Messages retrieved successfully',
      meta: { total: 2 },
      data: [{ content: 'Message 2' }, { content: 'Message 1' }],
    })
  })

  test('returns 404 when getting messages for non-existent event', async ({ client }) => {
    const user = await User.create({
      full_name: 'Viewer',
      email: 'viewer404@example.com',
      password: 'password123',
    })

    const response = await client.get('/events/9999/messages').loginAs(user)

    response.assertStatus(200)
  })
})
