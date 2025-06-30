import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#auth/models/user'
import Event from '#events/models/event'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  // @example(msg_123456789)
  // @format(string)
  declare id: string

  @column()
  // @example(1)
  // @required
  declare userId: string

  @column()
  // @example(1)
  // @required
  declare eventId: string

  @column()
  // @example(This is a great event! Looking forward to it.)
  // @required
  // @props({"minLength": 1, "maxLength": 1000})
  declare content: string

  @column.dateTime({ autoCreate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare createdAt: DateTime

  @belongsTo(() => User)
  // @no-swagger
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Event)
  // @no-swagger
  declare event: BelongsTo<typeof Event>
}
