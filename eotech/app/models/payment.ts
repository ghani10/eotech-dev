import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import type Order from '#models/order'

export type PaymentMethod = 'qris' | 'va' | 'transfer'
export type PaymentStatus = 'pending' | 'reject' | 'approved'

export default class Payment extends BaseModel {
  public static primaryKey = 'payment_id'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare paymentId: string

  @column()
  declare paymentMethod: PaymentMethod

  @column()
  declare paymentStatus: PaymentStatus

  @column.dateTime()
  declare paymentExpiredAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static assignUuid(payment: Payment) {
    if (!payment.paymentId) {
      payment.paymentId = uuidv4()
    }
  }

  @hasOne(() => require('#models/order').default, {
    foreignKey: 'paymentId',
    localKey: 'paymentId',
  })
  declare order: HasOne<typeof Order>
}