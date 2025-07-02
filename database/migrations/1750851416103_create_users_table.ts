import { BaseSchema } from '@adonisjs/lucid/schema'
import { UserRoles } from '#auth/enums/users'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name').notNullable()
      table.string('email').notNullable().unique()
      table.string('banner_url').nullable()
      table.string('password').notNullable()
      table.enu('role', Object.values(UserRoles)).notNullable().defaultTo(UserRoles.USER)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
