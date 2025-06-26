import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { type BelongsTo, type HasMany } from '@adonisjs/lucid/types/relations'
import EventType from '#events/models/event_type'
import EventSubtype from '#events/models/event_subtype'
import EventUser from '#events/models/event_user'
import EventArtist from '#events/models/event_artist'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

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
  declare typeId: number

  @column()
  declare subtypeId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => EventType)
  declare type: BelongsTo<typeof EventType>

  @belongsTo(() => EventSubtype)
  declare subtype: BelongsTo<typeof EventSubtype>

  @hasMany(() => EventUser)
  declare participants: HasMany<typeof EventUser>

  @hasMany(() => EventArtist)
  declare artists: HasMany<typeof EventArtist>
}
