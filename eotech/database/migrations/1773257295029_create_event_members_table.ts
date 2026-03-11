import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_members'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('event_member_id').primary().notNullable()
      table
        .uuid('event_id')
        .references('event_id')
        .inTable('events')
        .onDelete('CASCADE')
        .notNullable()
      table
        .uuid('user_id')
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table
        .enum('role', [
          'guest',
          'participant',
          'event_organizer_admin',
          'volunteer_organizer',
          'super_admin',
        ])
        .defaultTo('volunteer_organizer')
        .notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}