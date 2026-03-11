import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import type Event from '#models/event'
import type Ticket from '#models/ticket'

export default class TicketType extends BaseModel {
  public static primaryKey = 'ticket_type_id'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare ticketTypeId: string

  @column()
  declare ticketName: string

  @column()
  declare price: number

  @column()
  declare quota: number

  @column.dateTime()
  declare salesStartDate: DateTime | null

  @column.dateTime()
  declare salesEndDate: DateTime | null

  @column()
  declare perOrderLimit: number | null

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare eventId: string

  @beforeCreate()
  static assignUuid(ticketType: TicketType) {
    if (!ticketType.ticketTypeId) {
      ticketType.ticketTypeId = uuidv4()
    }
  }

  @belongsTo(() => require('#models/event').default, {
    foreignKey: 'eventId',
    localKey: 'eventId',
  })
  declare event: BelongsTo<typeof Event>

  @hasMany(() => require('#models/ticket').default, {
    foreignKey: 'ticketTypeId',
    localKey: 'ticketTypeId',
  })
  declare tickets: HasMany<typeof Ticket>
}