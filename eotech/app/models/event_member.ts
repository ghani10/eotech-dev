import { BaseModel, column, beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import type User from '#models/user'
import type Event from '#models/event'
import type { UserRole } from '#models/user'

export default class EventMember extends BaseModel {
  public static primaryKey = 'event_member_id'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare eventMemberId: string

  @column()
  declare eventId: string

  @column()
  declare userId: string

  @column()
  declare role: UserRole

  @beforeCreate()
  static assignUuid(member: EventMember) {
    if (!member.eventMemberId) {
      member.eventMemberId = uuidv4()
    }
  }

  @belongsTo(() => require('#models/event').default, {
    foreignKey: 'eventId',
    localKey: 'eventId',
  })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => require('#models/user').default, {
    foreignKey: 'userId',
    localKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
}