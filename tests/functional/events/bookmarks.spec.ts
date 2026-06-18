import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Events / bookmarks', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('allows a user to bookmark an event', async ({ client }) => {
    const user = await User.create({
      full_name: 'Bookmarker',
      email: 'bookmarker@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Bookmarkable Event',
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

    const response = await client.post('/bookmarks').loginAs(user).json({ eventId: event.id })

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Event bookmarked successfully',
      data: {
        eventId: event.id,
        userId: user.id,
        isFavorite: true,
      },
    })
  })

  test('lists bookmarked events', async ({ client }) => {
    const user = await User.create({
      full_name: 'Bookmarker List',
      email: 'bookmarker-list@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Bookmarked Event',
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

    await client.post('/bookmarks').loginAs(user).json({ eventId: event.id })

    const response = await client.get('/bookmarks').loginAs(user)

    response.assertStatus(200)

    response.assertBodyContains({
      message: 'Bookmarks retrieved successfully',
      data: {
        data: [{ title: 'Bookmarked Event' }],
        meta: { total: 1 },
      },
    })
  })

  test('checks if an event is bookmarked', async ({ client }) => {
    const user = await User.create({
      full_name: 'Bookmarker Check',
      email: 'bookmarker-check@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Checked Bookmark',
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

    const response1 = await client.get(`/bookmarks/check/${event.id}`).loginAs(user)
    response1.assertStatus(200)
    response1.assertBodyContains({
      message: 'Bookmark status retrieved successfully',
      data: { isBookmarked: false },
    })

    await client.post('/bookmarks').loginAs(user).json({ eventId: event.id })

    const response2 = await client.get(`/bookmarks/check/${event.id}`).loginAs(user)
    response2.assertStatus(200)
    response2.assertBodyContains({
      message: 'Bookmark status retrieved successfully',
      data: { isBookmarked: true },
    })
  })

  test('removes a bookmark', async ({ client }) => {
    const user = await User.create({
      full_name: 'Bookmarker Remover',
      email: 'bookmarker-remove@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'To Be Unbookmarked',
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

    await client.post('/bookmarks').loginAs(user).json({ eventId: event.id })

    const response = await client.delete(`/bookmarks/${event.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Bookmark removed successfully',
    })
  })
})
