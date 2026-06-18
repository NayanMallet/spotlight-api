import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import EventUser from '#events/models/event_user'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Events / join and quit', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('allows a user to join an event', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Joiner User',
      email: 'joiner@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Joinable Event',
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

    const response = await client.post(`/events/join/${event.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Event joined successfully',
    })

    const membership = await EventUser.query()
      .where('event_id', event.id)
      .where('user_id', user.id)
      .first()
    assert.isNotNull(membership)
  })

  test('allows a user to join an already joined event idempotently', async ({ client }) => {
    const user = await User.create({
      full_name: 'Double Joiner',
      email: 'double-joiner@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Repeat Event',
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

    await EventUser.create({
      hasJoined: true,
      eventId: event.id,
      userId: user.id,
    })

    const response = await client.post(`/events/join/${event.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Event joined successfully',
    })
  })

  test('allows a user to quit an event', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Quitter User',
      email: 'quitter@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Quittable Event',
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

    await EventUser.create({
      hasJoined: true,
      eventId: event.id,
      userId: user.id,
    })

    const response = await client.post(`/events/quit/${event.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Event quit successfully',
    })

    const membership = await EventUser.query()
      .where('event_id', event.id)
      .where('user_id', user.id)
      .first()
    assert.isNotNull(membership)
    assert.isFalse(Boolean(membership!.hasJoined))
  })

  test('returns 404 when quitting an event not joined', async ({ client }) => {
    const user = await User.create({
      full_name: 'Not Joined Quitter',
      email: 'not-joined@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Other Event',
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

    const response = await client.post(`/events/quit/${event.id}`).loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'User has not joined this event',
    })
  })

  test('lists events joined by the user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Joined List User',
      email: 'joined-list@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Joined Event',
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

    await EventUser.create({
      hasJoined: true,
      eventId: event.id,
      userId: user.id,
    })

    const response = await client.get('/events/joined').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Joined events retrieved successfully',
      data: {
        data: [{ title: 'Joined Event' }],
      },
    })
  })

  test('checks if an event is joined', async ({ client }) => {
    const user = await User.create({
      full_name: 'Checker User',
      email: 'checker@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Checked Event',
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

    await EventUser.create({
      hasJoined: true,
      eventId: event.id,
      userId: user.id,
    })

    const response = await client.get(`/events/joined/${event.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Join status retrieved successfully',
      data: { hasJoined: true },
    })

    const otherEvent = await Event.create({
      title: 'Unjoined Event',
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

    const response2 = await client.get(`/events/joined/${otherEvent.id}`).loginAs(user)
    response2.assertStatus(200)
    response2.assertBodyContains({
      message: 'Join status retrieved successfully',
      data: { hasJoined: false },
    })
  })
})
