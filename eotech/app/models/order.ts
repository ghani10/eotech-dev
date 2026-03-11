import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import type Payment from '#models/payment'
import type Event from '#models/event'
import type Ticket from '#models/ticket'

export default class Order extends BaseModel {
  public static primaryKey = 'order_id'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare orderId: string

  @column()
  declare buyerName: string

  @column()
  declare buyerEmail: string

  @column()
  declare buyerPhone: string | null

  @column()
  declare totalAmount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare paymentId: string | null

  @column()
  declare eventId: string

  @beforeCreate()
  static assignUuid(order: Order) {
    if (!order.orderId) {
      order.orderId = uuidv4()
    }
  }

  @belongsTo(() => require('#models/payment').default, {
    foreignKey: 'paymentId',
    localKey: 'paymentId',
  })
  declare payment: BelongsTo<typeof Payment>

  @belongsTo(() => require('#models/event').default, {
    foreignKey: 'eventId',
    localKey: 'eventId',
  })
  declare event: BelongsTo<typeof Event>

  @hasMany(() => require('#models/ticket').default, {
    foreignKey: 'orderId',
    localKey: 'orderId',
  })
  declare tickets: HasMany<typeof Ticket>
}