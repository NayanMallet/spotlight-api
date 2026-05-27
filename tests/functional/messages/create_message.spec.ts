import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import Message from '#messages/models/message'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Messages / create message', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates a new message in an event', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Messenger User',
      email: 'messenger@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Event for Messages',
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

    const response = await client.post('/messages').loginAs(user).json({
      eventId: event.id,
      content: 'Hello everyone!',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Message created successfully',
      data: {
        content: 'Hello everyone!',
      },
    })

    const createdMessage = await Message.findByOrFail('content', 'Hello everyone!')
    assert.equal(createdMessage.userId, user.id)
  })

  test('rejects message with empty content', async ({ client }) => {
    const user = await User.create({
      full_name: 'Silent User',
      email: 'silent@example.com',
      password: 'password123',
    })

    const response = await client.post('/messages').loginAs(user).json({
      eventId: 1,
      content: '',
    })

    response.assertStatus(400)
  })

  test('rejects message for non-existent event', async ({ client }) => {
    const user = await User.create({
      full_name: 'Lost User',
      email: 'lost@example.com',
      password: 'password123',
    })

    const response = await client.post('/messages').loginAs(user).json({
      eventId: 9999,
      content: 'Is anyone here?',
    })

    response.assertStatus(500)
  })
})
