import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ticket_types'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('ticket_type_id').notNullable().primary()
      table.string('ticket_name').notNullable()
      table.integer('price').nullable()
      table.integer('quota').nullable()
      table.dateTime('sales_start_date')
      table.dateTime('sales_end_date')
      table.integer('per_order_limit')
      table.string('description')

      //foreign key
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