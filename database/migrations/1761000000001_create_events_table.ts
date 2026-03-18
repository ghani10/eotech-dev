import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('event_id').notNullable().primary()
      table.string('title', 50).notNullable()
      table.string('description').nullable()
      table.string('location').notNullable()
      table.string('organizer_contact', 50).notNullable()
      table.dateTime('registration_start_at').notNullable()
      table.dateTime('registration_end_at').notNullable()
      table.string('banner', 50).nullable()
      table.enum('status', [
        'pending',
        'publish',
        'archived',
      ]).defaultTo('pending').notNullable()
      table.string('slug')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      //fk to user id
      table.uuid('owner_id').notNullable()
      table.foreign('owner_id').references('users.user_id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}