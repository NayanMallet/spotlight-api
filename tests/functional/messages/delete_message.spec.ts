import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import Message from '#messages/models/message'
import { UserRoles } from '#auth/enums/users'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Messages / delete message', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('deletes a message as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-delete-msg@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const user = await User.create({
      full_name: 'User',
      email: 'user-delete-msg@example.com',
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
      userId: user.id.toString(),
      content: 'Message to delete',
    })

    const response = await client.delete(`/messages/${message.id}`).loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Message deleted successfully',
    })

    const deletedMessage = await Message.find(message.id)
    assert.isNull(deletedMessage)
  })

  test('rejects message deletion by regular user', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-fail-delete-msg@example.com',
      password: 'password123',
    })

    const message = await Message.create({
      eventId: '1',
      userId: user.id.toString(),
      content: 'Protected message',
    })

    const response = await client.delete(`/messages/${message.id}`).loginAs(user)

    response.assertStatus(403)

    const messageStillExists = await Message.find(message.id)
    assert.isNotNull(messageStillExists)
  })
})
