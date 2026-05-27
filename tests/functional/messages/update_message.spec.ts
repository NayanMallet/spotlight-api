import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import Message from '#messages/models/message'
import { UserRoles } from '#auth/enums/users'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Messages / update message', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('updates a message as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-update-msg@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const user = await User.create({
      full_name: 'User',
      email: 'user-msg@example.com',
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
      content: 'Old content',
    })

    const response = await client.put(`/messages/${message.id}`).loginAs(admin).json({
      content: 'Updated by admin',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Message updated successfully',
      data: {
        content: 'Updated by admin',
      },
    })

    await message.refresh()
    assert.equal(message.content, 'Updated by admin')
  })

  test('rejects message update by regular user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-fail-update-msg@example.com',
      password: 'password123',
    })

    const message = await Message.create({
      eventId: '1',
      userId: user.id.toString(),
      content: 'Untouchable content',
    })

    const response = await client.put(`/messages/${message.id}`).loginAs(user).json({
      content: 'Illegal update',
    })

    response.assertStatus(403)
  })
})
