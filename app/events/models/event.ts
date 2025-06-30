import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import EventUser from '#events/models/event_user'
import EventArtist from '#events/models/event_artist'
import { EventType, EventSubtype } from '#events/enums/events'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  // @example(1)
  declare id: number

  @column()
  // @example(Summer Music Festival)
  // @required
  // @props({"minLength": 3, "maxLength": 255})
  declare title: string

  @column()
  // @example(An amazing outdoor music festival featuring top artists)
  // @props({"maxLength": 1000})
  declare description: string | null

  @column({ columnName: 'banner_url' })
  // @example(https://example.com/event-banner.jpg)
  // @format(uri)
  declare bannerUrl: string | null

  @column.date()
  // @example(2024-07-15)
  // @format(date)
  // @required
  declare startDate: DateTime

  @column.date()
  // @example(2024-07-17)
  // @format(date)
  // @required
  declare endDate: DateTime

  @column.dateTime({ columnName: 'start_hour' })
  // @example(2024-07-15T18:00:00.000Z)
  // @format(date-time)
  // @required
  declare startHour: DateTime

  @column.dateTime({ columnName: 'open_hour', serializeAs: null })
  // @no-swagger
  declare openHour: DateTime | null

  @column()
  // @example(40.7128)
  // @format(float)
  // @required
  // @props({"minimum": -90, "maximum": 90})
  declare latitude: number

  @column()
  // @example(-74.0060)
  // @format(float)
  // @required
  // @props({"minimum": -180, "maximum": 180})
  declare longitude: number

  @column()
  // @example(Central Park)
  // @required
  // @props({"minLength": 2, "maxLength": 255})
  declare placeName: string

  @column()
  // @example(1234 Main Street)
  // @required
  // @props({"minLength": 5, "maxLength": 255})
  declare address: string

  @column()
  // @example(New York)
  // @required
  // @props({"minLength": 2, "maxLength": 100})
  declare city: string

  @column()
  // @example(concert)
  // @enum(concert, festival, exhibition, conference)
  // @required
  declare type: EventType

  @column()
  // @example(rock)
  // @enum(rock, hiphop, jazz, techno, classical)
  // @required
  declare subtype: EventSubtype

  @column.dateTime({ autoCreate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare updatedAt: DateTime

  @hasMany(() => EventUser)
  // @no-swagger
  declare participants: HasMany<typeof EventUser>

  @hasMany(() => EventArtist)
  // @no-swagger
  declare artists: HasMany<typeof EventArtist>
}
