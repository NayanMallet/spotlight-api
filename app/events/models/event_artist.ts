import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Event from '#events/models/event'
import Artist from '#artists/models/artist'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class EventArtist extends BaseModel {
  @column({ isPrimary: true })
  // @example(1)
  declare id: number

  @column()
  // @example(1)
  // @required
  declare eventId: number

  @column()
  // @example(1)
  // @required
  declare artistId: number

  @column.dateTime({ autoCreate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare updatedAt: DateTime

  @belongsTo(() => Event)
  // @no-swagger
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => Artist)
  // @no-swagger
  declare artist: BelongsTo<typeof Artist>
}
