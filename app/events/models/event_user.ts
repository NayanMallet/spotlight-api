import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'

import Event from '#events/models/event'
import User from '#auth/models/user'

export default class EventUser extends BaseModel {
  @column({ isPrimary: true })
  // @example(1)
  declare id: number

  @column()
  // @example(1)
  // @required
  declare userId: number

  @column()
  // @example(1)
  // @required
  declare eventId: number

  @column()
  // @example(true)
  // @required
  declare isFavorite: boolean

  @column()
  // @example(false)
  // @required
  declare hasJoined: boolean

  @belongsTo(() => User)
  // @no-swagger
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Event)
  // @no-swagger
  declare event: BelongsTo<typeof Event>
}
