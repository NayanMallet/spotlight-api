import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateEventsTable extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('banner_url').nullable()
      table.date('start_date').notNullable()
      table.date('end_date').nullable()
      table.dateTime('start_hour').nullable()
      table.dateTime('open_hour').nullable()
      table.float('latitude', 8, 2).notNullable()
      table.float('longitude', 8, 2).notNullable()
      table.string('place_name').notNullable()
      table.string('address').notNullable()
      table.string('city').notNullable()
      table.enu('type', ['concert', 'festival', 'exhibition', 'conference']).notNullable()
      table.enu('subtype', ['rock', 'hiphop', 'jazz', 'techno', 'classical']).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
