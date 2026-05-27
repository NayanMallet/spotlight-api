import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import { UserRoles } from '#auth/enums/users'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Events / update event', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('updates an existing event as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-update-event@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const event = await Event.create({
      title: 'Old Title',
      startDate: DateTime.now().plus({ days: 1 }),
      endDate: DateTime.now().plus({ days: 1, hours: 2 }),
      startHour: DateTime.now().plus({ days: 1 }),
      latitude: 43.6047,
      longitude: 1.4442,
      placeName: 'Old Place',
      address: 'Old Address',
      city: 'Old City',
      type: EventType.CONCERT,
      subtype: EventSubtype.ROCK,
    })

    const response = await client.put(`/events/${event.id}`).loginAs(admin).json({
      title: 'Updated Title',
      city: 'New City',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Event updated successfully',
      data: {
        id: event.id,
        title: 'Updated Title',
        city: 'New City',
      },
    })

    await event.refresh()
    assert.equal(event.title, 'Updated Title')
    assert.equal(event.city, 'New City')
  })

  test('rejects event update by regular user', async ({ client }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-update-event@example.com',
      password: 'password123',
      role: UserRoles.USER,
    })

    const event = await Event.create({
      title: 'Unauthorized Update',
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

    const response = await client.put(`/events/${event.id}`).loginAs(user).json({
      title: 'Hacked Title',
    })

    response.assertStatus(403)
  })

  test('returns 404 when updating non-existent event', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-update-404@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const response = await client.put('/events/9999').loginAs(admin).json({
      title: 'Missing Event',
    })

    response.assertStatus(404)
  })

  test('rejects invalid update payloads', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-invalid-update@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const event = await Event.create({
      title: 'Valid Event',
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

    const response = await client.put(`/events/${event.id}`).loginAs(admin).json({
      latitude: 100,
    })

    response.assertStatus(400)
  })
})
