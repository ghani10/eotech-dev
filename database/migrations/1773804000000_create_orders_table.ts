import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('order_id').notNullable().primary()
      table.string('buyer_name').nullable()
      table.string('buyer_email').nullable()
      table.string('buyer_phone').nullable()
      table.integer('total_amount').notNullable()

      // foreign key
      // table.uuid('payment_id').notNullable()
      // table.foreign('payment_id').references('payments.payment_id').onDelete('CASCADE')
      table.uuid('event_id').notNullable()
      table.foreign('event_id').references('events.event_id').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}