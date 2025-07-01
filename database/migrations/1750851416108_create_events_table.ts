import { BaseSchema } from '@adonisjs/lucid/schema'
import { EventType, EventSubtype } from '#events/enums/events'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('banner_url').nullable()
      table.date('start_date').notNullable()
      table.date('end_date').nullable()
      table.dateTime('start_hour').nullable()
      table.dateTime('open_hour').nullable()
      table.float('latitude').notNullable()
      table.float('longitude').notNullable()
      table.string('place_name').notNullable()
      table.string('address').notNullable()
      table.string('city').notNullable()

      // Remplacement des relations par des enums
      table.enu('type', Object.values(EventType)).notNullable()
      table.enu('subtype', Object.values(EventSubtype)).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
