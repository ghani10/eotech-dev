import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('payment_id').primary().notNullable()
      table
        .enum('payment_method', ['qris', 'va', 'transfer'])
        .defaultTo('qris')
        .notNullable()
      table
        .enum('payment_status', ['pending', 'reject', 'approved'])
        .defaultTo('pending')
        .notNullable()
      table.datetime('payment_expired_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}