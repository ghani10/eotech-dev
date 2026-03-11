import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('event_id').primary()
      table.string('title', 50).notNullable()
      table.string('description', 255)
      table.string('location', 50)
      table.string('organizer_contact', 50)
      table.datetime('registration_start_at')
      table.datetime('registration_end_time')
      table.string('banner', 50)
      table
        .enum('status', ['pending', 'published', 'archived'])
        .defaultTo('pending')
        .notNullable()
      table.string('slug', 50).unique()
      table.timestamp('created_at', { useTz: false })
      table.timestamp('updated_at', { useTz: false })

      // FK → users.id (incremental integer)
      table
        .uuid('user_id')
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}