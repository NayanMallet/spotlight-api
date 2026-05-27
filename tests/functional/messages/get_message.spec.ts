import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import Message from '#messages/models/message'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Messages / get message', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns a single message by ID', async ({ client }) => {
    const user = await User.create({
      full_name: 'Viewer',
      email: 'viewer-single@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Event',
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

    const message = await Message.create({
      eventId: event.id.toString(),
      userId: user.id,
      content: 'Unique content',
    })

    const response = await client.get(`/messages/${message.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: message.id,
        content: 'Unique content',
      },
    })
  })

  test('returns 404 when message does not exist', async ({ client }) => {
    const user = await User.create({
      full_name: 'Viewer',
      email: 'viewer404-msg@example.com',
      password: 'password123',
    })

    const response = await client.get('/messages/9999').loginAs(user)

    response.assertStatus(404)
  })
})
