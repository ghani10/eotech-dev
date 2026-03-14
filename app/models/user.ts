import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { v4 as uuidv4 } from 'uuid'

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
  declare role: 'guest' | 'participant' | 'event_organizer_admin' | 'volunteer_organizer' | 'super_admin'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static assignUuid(user: User) {
    if (!user.userId) {
      user.userId = uuidv4()
    }
  }

  get initials(): string {
    const [first, last] = this.fullName
      ? this.fullName.split(' ')
      : this.email.split('@')

    if (first && last) {
      return `Halo, ${first.slice(0, 5)}`.toUpperCase()
    }

    return first.slice(0, 2).toUpperCase()
  }
}