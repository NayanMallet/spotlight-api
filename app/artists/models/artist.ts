import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import EventArtist from '#events/models/event_artist'

export default class Artist extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare image: string

  @hasMany(() => EventArtist)
  declare performances: HasMany<typeof EventArtist>
}
