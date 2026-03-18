import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tickets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('ticket_id').notNullable().primary()
      table.string('qrcode').notNullable()
      table.enum('status_ticket',[
        'flash_sale',
        'reguler',
        'vip'
      ]).defaultTo('reguler').notNullable()
      table.dateTime('checkin_at').nullable()
      
      //foreign key
      table.uuid('order_id').notNullable()
      table.foreign('order_id').references('orders.order_id').onDelete('CASCADE')
      table.uuid('ticket_type_id').notNullable()
      table.foreign('ticket_type_id').references('ticket_types.ticket_type_id').onDelete('CASCADE')


      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}