import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#auth/models/user'
import { OAuthProviders } from '#auth/enums/oauth_providers'

export default class OAuthProvider extends BaseModel {
  @column({ isPrimary: true })
  // @example(1)
  declare id: number

  @column()
  // @example(1)
  declare userId: number

  @column()
  // @example(google)
  declare providerName: OAuthProviders

  @column()
  // @example(123456789)
  declare providerId: string

  @column.dateTime({ autoCreate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare updatedAt: DateTime

  @belongsTo(() => User)
  // @no-swagger
  declare user: BelongsTo<typeof User>
}
