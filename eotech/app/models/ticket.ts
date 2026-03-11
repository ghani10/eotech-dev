import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import type Order from '#models/order'
import type TicketType from '#models/ticket_type'

export type StatusTicket = 'flashSale' | 'reguler' | 'vip'

export default class Ticket extends BaseModel {
  public static primaryKey = 'ticket_id'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare ticketId: string

  @column()
  declare qrCode: string | null

  @column()
  declare statusTicket: StatusTicket

  @column.dateTime()
  declare checkinAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare orderId: string

  @column()
  declare ticketTypeId: string

  @beforeCreate()
  static assignUuid(ticket: Ticket) {
    if (!ticket.ticketId) {
      ticket.ticketId = uuidv4()
    }
  }

  @belongsTo(() => require('#models/order').default, {
    foreignKey: 'orderId',
    localKey: 'orderId',
  })
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => require('#models/ticket_type').default, {
    foreignKey: 'ticketTypeId',
    localKey: 'ticketTypeId',
  })
  declare ticketType: BelongsTo<typeof TicketType>
}