import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import EventUser from '#events/models/event_user'
import EventArtist from '#events/models/event_artist'
import { EventType, EventSubtype } from '#events/enums/events'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column({ columnName: 'banner_url' })
  declare bannerUrl: string | null

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column.dateTime({ columnName: 'start_hour' })
  declare startHour: DateTime

  @column.dateTime({ columnName: 'open_hour', serializeAs: null })
  declare openHour: DateTime | null

  @column()
  declare latitude: number

  @column()
  declare longitude: number

  @column()
  declare placeName: string

  @column()
  declare address: string

  @column()
  declare city: string

  @column()
  declare type: EventType

  @column()
  declare subtype: EventSubtype

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => EventUser)
  declare participants: HasMany<typeof EventUser>

  @hasMany(() => EventArtist)
  declare artists: HasMany<typeof EventArtist>
}
