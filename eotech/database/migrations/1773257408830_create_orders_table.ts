import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('order_id').primary().notNullable()
      table.string('buyer_name', 50).notNullable()
      table.string('buyer_email', 50).notNullable()
      table.string('buyer_phone', 50).nullable()
      table.integer('total_amount').unsigned().notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // FK → payments.payment_id (UUID)
      table
        .uuid('payment_id')
        .references('payment_id')
        .inTable('payments')
        .onDelete('SET NULL')
        .nullable()

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