import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import EventArtist from '#events/models/event_artist'

export default class Artist extends BaseModel {
  @column({ isPrimary: true })
  // @example(1)
  declare id: number

  @column()
  // @example(Taylor Swift)
  // @required
  // @props({"minLength": 2, "maxLength": 255})
  declare name: string

  @column()
  // @example(https://example.com/artist-photo.jpg)
  // @format(uri)
  // @required
  declare image: string

  @column.dateTime({ autoCreate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare updatedAt: DateTime

  @hasMany(() => EventArtist)
  // @no-swagger
  declare performances: HasMany<typeof EventArtist>
}
