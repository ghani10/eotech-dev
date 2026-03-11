import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ticket_types'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('ticket_type_id').primary().notNullable()
      table.string('ticket_name', 50).notNullable()
      table.integer('price').unsigned().notNullable()
      table.integer('quota').unsigned().notNullable()
      table.datetime('sales_start_date').nullable()
      table.datetime('sales_end_date').nullable()
      table.integer('per_order_limit').unsigned().nullable()
      table.string('description', 255).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // FK → events.event_id (UUID)
      table
        .uuid('event_id')
        .references('event_id')
        .inTable('events')
        .onDelete('CASCADE')
        .notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}