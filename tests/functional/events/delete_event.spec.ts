import { test } from '@japa/runner'
import User from '#auth/models/user'
import Event from '#events/models/event'
import { UserRoles } from '#auth/enums/users'
import { EventType, EventSubtype } from '#events/enums/events'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Events / delete event', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('deletes an existing event as an admin', async ({ client, assert }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-delete-event@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const event = await Event.create({
      title: 'Event to Delete',
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

    const response = await client.delete(`/events/${event.id}`).loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Event deleted successfully',
    })

    const deletedEvent = await Event.find(event.id)
    assert.isNull(deletedEvent)
  })

  test('rejects event deletion by regular user', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Regular User',
      email: 'user-delete-event@example.com',
      password: 'password123',
      role: UserRoles.USER,
    })

    const event = await Event.create({
      title: 'Event Protected',
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

    const response = await client.delete(`/events/${event.id}`).loginAs(user)

    response.assertStatus(403)

    const eventStillExists = await Event.find(event.id)
    assert.isNotNull(eventStillExists)
  })

  test('returns 404 when deleting non-existent event', async ({ client }) => {
    const admin = await User.create({
      full_name: 'Admin User',
      email: 'admin-delete-404@example.com',
      password: 'password123',
      role: UserRoles.ADMIN,
    })

    const response = await client.delete('/events/9999').loginAs(admin)

    response.assertStatus(404)
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.delete('/events/1')
    response.assertStatus(401)
  })
})
