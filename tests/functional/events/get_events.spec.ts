import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Events / get events', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns a paginated list of events', async ({ client }) => {
    const user = await User.create({
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    await Event.createMany([
      {
        title: 'Rock Concert 1',
        description: 'Awesome rock concert',
        startDate: DateTime.now().plus({ days: 1 }),
        endDate: DateTime.now().plus({ days: 1, hours: 3 }),
        startHour: DateTime.now().set({ hour: 20, minute: 0 }),
        latitude: 43.6047,
        longitude: 1.4442,
        placeName: 'Le Bikini',
        address: 'Rue Théodore Lenôtre',
        city: 'Toulouse',
        type: EventType.CONCERT,
        subtype: EventSubtype.ROCK,
      },
      {
        title: 'Jazz Night',
        description: 'Smooth jazz evening',
        startDate: DateTime.now().plus({ days: 2 }),
        endDate: DateTime.now().plus({ days: 2, hours: 2 }),
        startHour: DateTime.now().set({ hour: 21, minute: 0 }),
        latitude: 43.6047,
        longitude: 1.4442,
        placeName: 'Cave Poésie',
        address: '7 Rue du Taur',
        city: 'Toulouse',
        type: EventType.CONCERT,
        subtype: EventSubtype.JAZZ,
      },
    ])

    const response = await client.get('/events').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully',
      meta: {
        total: 3,
      },
    })
  })

  test('filters events by city', async ({ client }) => {
    const user = await User.create({
      full_name: 'Filter User',
      email: 'filter@example.com',
      password: 'password123',
    })

    await Event.create({
      title: 'Toulouse Event',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      startHour: DateTime.now().plus({ days: 1 }),
      latitude: 43.6047,
      longitude: 1.4442,
      placeName: 'Place du Capitole',
      address: 'Place du Capitole',
      city: 'Toulouse',
      type: EventType.CONCERT,
      subtype: EventSubtype.ROCK,
    })

    await Event.create({
      title: 'Paris Event',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      startHour: DateTime.now().plus({ days: 1 }),
      latitude: 48.8566,
      longitude: 2.3522,
      placeName: 'Le Zenith',
      address: 'Parc de la Villette',
      city: 'Paris',
      type: EventType.CONCERT,
      subtype: EventSubtype.ROCK,
    })

    const response = await client.get('/events').qs({ city: 'Toulouse' }).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully',
      meta: { total: 2 },
    })
  })

  test('filters events by type and subtype', async ({ client }) => {
    const user = await User.create({
      full_name: 'Filter Type User',
      email: 'filter-type@example.com',
      password: 'password123',
    })

    await Event.create({
      title: 'Rock Concert',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      startHour: DateTime.now().plus({ days: 1 }),
      latitude: 43.6047,
      longitude: 1.4442,
      placeName: 'Place 1',
      address: 'Address 1',
      city: 'Toulouse',
      type: EventType.CONCERT,
      subtype: EventSubtype.ROCK,
    })

    await Event.create({
      title: 'Techno Festival',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      startHour: DateTime.now().plus({ days: 1 }),
      latitude: 43.6047,
      longitude: 1.4442,
      placeName: 'Place 2',
      address: 'Address 2',
      city: 'Toulouse',
      type: EventType.FESTIVAL,
      subtype: EventSubtype.TECHNO,
    })

    const response = await client
      .get('/events')
      .qs({ type: EventType.CONCERT, subtype: EventSubtype.ROCK })
      .loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully',
      meta: { total: 1 },
    })
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.get('/events')
    response.assertStatus(401)
  })
})
