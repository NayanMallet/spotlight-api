import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('banner_url').nullable()
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.dateTime('start_hour').notNullable()
      table.dateTime('open_hour').nullable()
      table.float('latitude').notNullable()
      table.float('longitude').notNullable()
      table.string('place_name').notNullable()
      table.string('address').notNullable()
      table.string('city').notNullable()

      table
        .integer('type_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('event_types')
        .onDelete('CASCADE')

      table
        .integer('subtype_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('event_subtypes')
        .onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
