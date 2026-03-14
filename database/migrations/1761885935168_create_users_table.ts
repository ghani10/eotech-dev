import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').notNullable().primary()
      table.string('full_Name', 50).nullable()
      table.string('email', 50).notNullable().unique()
      table.string('password').notNullable()
      table.enum('role', [
          'guest',
          'participant',
          'event_organizer_admin',
          'volunteer_organizer',
          'super_admin',
        ])
        .defaultTo('guest')
        .notNullable()



      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
