import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Event from '#events/models/event'
import Artist from '#artists/models/artist'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class EventArtist extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare eventId: number

  @column()
  declare artistId: number

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => Artist)
  declare artist: BelongsTo<typeof Artist>
}
