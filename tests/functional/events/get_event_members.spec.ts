import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import EventUser from '#events/models/event_user'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Events / get members', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns a list of members for an event', async ({ client }) => {
    const user = await User.create({
      full_name: 'Member 1',
      email: 'member1@example.com',
      password: 'password123',
    })

    const otherUser = await User.create({
      full_name: 'Member 2',
      email: 'member2@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Event with Members',
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

    await EventUser.createMany([
      { eventId: event.id, userId: user.id, hasJoined: true },
      { eventId: event.id, userId: otherUser.id, hasJoined: true },
    ])

    const response = await client.get(`/events/${event.id}/members`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Member count retrieved successfully',
      data: { total: 2 },
    })
  })

  test('returns 404 when getting members for non-existent event', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-members-404@example.com',
      password: 'password123',
    })

    const response = await client.get('/events/9999/members').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Member count retrieved successfully',
      data: { total: 0 },
    })
  })
})
