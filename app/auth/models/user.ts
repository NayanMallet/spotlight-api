import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import EventUser from '#events/models/event_user'
import Message from '#messages/models/message'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  // @example(1)
  declare id: number

  @column()
  // @example(John Doe)
  // @required
  declare full_name: string

  @column()
  // @example(johndoe@example.com)
  // @format(email)
  // @required
  declare email: string

  @column({ columnName: 'banner_url' })
  // @example(https://example.com/banner.jpg)
  // @format(uri)
  declare bannerUrl: string | null

  @column({ serializeAs: null })
  // @no-swagger
  declare password: string

  @column()
  // @example(google)
  // @enum(google, facebook, apple)
  declare oauthProvider: string | null

  @column()
  // @example(123456789)
  declare oauthId: string | null

  @column.dateTime({ autoCreate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  // @example(2024-01-01T00:00:00.000Z)
  // @format(date-time)
  declare updatedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => EventUser)
  // @no-swagger
  declare joinedEvents: HasMany<typeof EventUser>

  @hasMany(() => Message)
  // @no-swagger
  declare messages: HasMany<typeof Message>
}
