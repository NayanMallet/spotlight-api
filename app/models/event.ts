import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime()
  declare startDate: DateTime

  @column.dateTime({ serializeAs: null })
  declare endDate?: DateTime

  @column()
  declare address: string

  @column()
  declare location: string

  @column()
  declare lat: number | null

  @column()
  declare lng: number | null

  @column()
  declare description: string

  @column()
  declare img: string

  @column()
  declare lineup: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
