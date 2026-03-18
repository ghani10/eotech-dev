import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_members'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('event_member_id').notNullable().unique().primary()
      table.enum('role', [
        'guest',
        'participant',
        'event_organizer_admin',
        'volunteer_organizer',
        'super_admin'
      ]).defaultTo('volunteer_organizer').notNullable()

      // foreign key
      table.uuid('event_id').notNullable()
      table.foreign('event_id').references('events.event_id').onDelete('CASCADE')
      table.uuid('user_id').notNullable()
      table.foreign('user_id').references('users.user_id').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}