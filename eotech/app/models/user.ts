import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { v4 as uuidv4 } from 'uuid'
import type Event from '#models/event'

export type UserRole =
  | 'guest'
  | 'participant'
  | 'event_organizer_admin'
  | 'volunteer_organizer'
  | 'super_admin'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  public static primaryKey = 'user_id'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare userId: string

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: UserRole

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // ─── Hooks ────────────────────────────────────────────────────────────────

  @beforeCreate()
  static assignUuid(user: User) {
    if (!user.userId) {
      user.userId = uuidv4()
    }
  }

  // ─── Relations ────────────────────────────────────────────────────────────

  @hasMany(() => require('#models/event').default, {
    foreignKey: 'ownerId',
    localKey: 'userId',
  })
  declare ownedEvents: HasMany<typeof Event>

  @manyToMany(() => require('#models/event').default, {
    pivotTable: 'event_members',
    localKey: 'userId',
    pivotForeignKey: 'user_id',
    relatedKey: 'eventId',
    pivotRelatedForeignKey: 'event_id',
    pivotColumns: ['role'],
  })
  declare events: ManyToMany<typeof Event>

  // ─── Computed ─────────────────────────────────────────────────────────────

  get initials(): string {
    const [first, last] = this.fullName
      ? this.fullName.split(' ')
      : this.email.split('@')

    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }

    return first.slice(0, 2).toUpperCase()
  }
}