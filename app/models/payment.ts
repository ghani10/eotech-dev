import { PaymentSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Payment extends PaymentSchema {
    static primaryKey = 'payment_id'

    @column({ isPrimary: true })
    declare payment_id: string

    @column()
    declare payment_methods: 'qris' | 'transfer' | 'va'

    @column()
    declare payment_status: 'pending' | 'approved' | 'reject'

    @column()
    declare payment_expired_at: DateTime<boolean>

    //timestamp
    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime<boolean> | null

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime<boolean> | null

}