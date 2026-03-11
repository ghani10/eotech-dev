import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import type User from '#models/user'
import type TicketType from '#models/ticket_type'
import type Order from '#models/order'

export type EventStatus = 'pending' | 'published' | 'archived'

export default class Event extends BaseModel {
  public static primaryKey = 'event_id'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare eventId: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare location: string | null

  @column()
  declare organizerContact: string | null

  @column.dateTime()
  declare registrationStartAt: DateTime | null

  @column.dateTime()
  declare registrationEndTime: DateTime | null

  @column()
  declare banner: string | null

  @column()
  declare status: EventStatus

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // FK
  @column()
  declare ownerId: string

  // ─── Hooks ────────────────────────────────────────────────────────────────

  @beforeCreate()
  static assignUuid(event: Event) {
    if (!event.eventId) {
      event.eventId = uuidv4()
    }
  }

  // ─── Relations ────────────────────────────────────────────────────────────

  @belongsTo(() => require('#models/user').default, {
    foreignKey: 'ownerId',
    localKey: 'userId',
  })
  declare owner: BelongsTo<typeof User>

  @hasMany(() => require('#models/ticket_type').default, {
    foreignKey: 'eventId',
    localKey: 'eventId',
  })
  declare ticketTypes: HasMany<typeof TicketType>

  @hasMany(() => require('#models/order').default, {
    foreignKey: 'eventId',
    localKey: 'eventId',
  })
  declare orders: HasMany<typeof Order>

  @manyToMany(() => require('#models/user').default, {
    pivotTable: 'event_members',
    localKey: 'eventId',
    pivotForeignKey: 'event_id',
    relatedKey: 'userId',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['role'],
  })
  declare members: ManyToMany<typeof User>
}