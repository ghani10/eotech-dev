import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tickets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('ticket_id').primary().notNullable()
      table.text('qr_code').nullable()
      table
        .enum('status_ticket', ['active','used','invalid'])
        .defaultTo('active')
        .notNullable()
      table.timestamp('checkin_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // FK → orders.order_id (UUID)
      table
        .uuid('order_id')
        .references('order_id')
        .inTable('orders')
        .onDelete('CASCADE')
        .notNullable()

      // FK → ticket_types.ticket_type_id (UUID)
      table
        .uuid('ticket_type_id')
        .references('ticket_type_id')
        .inTable('ticket_types')
        .onDelete('CASCADE')
        .notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}