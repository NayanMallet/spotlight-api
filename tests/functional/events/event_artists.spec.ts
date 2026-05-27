import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import Artist from '#artists/models/artist'
import EventArtist from '#events/models/event_artist'
import { UserRoles } from '#auth/enums/users'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Events / event artists', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns artists associated with an event', async ({ client }) => {
    const user = await User.create({
      full_name: 'Artist Viewer',
      email: 'viewer@example.com',
      password: 'password123',
    })

    const event = await Event.create({
      title: 'Event with Artists',
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

    const artist = await Artist.create({
      name: 'The Great Artist',
      image: 'https://example.com/image.jpg',
    })

    await EventArtist.create({
      eventId: event.id,
      artistId: artist.id,
    })

    const response = await client.get(`/events/${event.id}/artists`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [{ name: 'The Great Artist' }],
    })
  })

  test('adds an artist to an event as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-add-artist@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const event = await Event.create({
      title: 'Empty Event',
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

    const artist = await Artist.create({
      name: 'New Performer',
      image: 'https://example.com/performer.jpg',
    })

    const response = await client
      .post(`/events/${event.id}/artists`)
      .loginAs(admin)
      .json({ artistIds: [artist.id] })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Artists added to event successfully',
    })

    const association = await EventArtist.query()
      .where('event_id', event.id)
      .where('artist_id', artist.id)
      .first()
    assert.isNotNull(association)
  })

  test('removes an artist from an event as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-remove-artist@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const event = await Event.create({
      title: 'Populated Event',
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

    const artist = await Artist.create({
      name: 'Ex-Performer',
      image: 'https://example.com/ex.jpg',
    })

    await EventArtist.create({
      eventId: event.id,
      artistId: artist.id,
    })

    const response = await client
      .delete(`/events/${event.id}/artists`)
      .loginAs(admin)
      .json({ artistIds: [artist.id] })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Artists removed from event successfully',
    })

    const association = await EventArtist.query()
      .where('event_id', event.id)
      .where('artist_id', artist.id)
      .first()
    assert.isNull(association)
  })

  test('rejects adding artist by regular user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-add-artist@example.com',
      password: 'password123',
    })

    const response = await client.post('/events/1/artists').loginAs(user).json({ artistIds: [1] })

    response.assertStatus(403)
  })
})

