// database/migrations/1773808043461_alter_orders_table.ts

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // 1. Create the column first (must match the type in payments table)
      // If payment_id in payments is a UUID:
      table.uuid('payment_id').nullable() 
      
      // 2. Then add the foreign key constraint
      table.foreign('payment_id')
        .references('payments.payment_id')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('payment_id')
      table.dropColumn('payment_id')
    })
  }
}
