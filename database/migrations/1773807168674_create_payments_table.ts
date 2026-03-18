import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('payment_id').notNullable().primary()
      table.enum('payment_methods',[
        'qris',
        'transfer',
        'va'
      ]).defaultTo('qris').notNullable()
      table.enum('payment_status',[
        'pending',
        'approved',
        'reject'
      ]).defaultTo('pending').notNullable()

      table.dateTime('payment_expired_at').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}