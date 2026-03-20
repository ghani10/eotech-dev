import { OrderSchema } from '#database/schema'
import { beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Payment from './payment.ts'
import Event from './event.ts'
import { v4 as uuidv4 } from 'uuid'




export default class Order extends OrderSchema {
    static primaryKey = 'order_id'

    @column({ isPrimary: true })
    declare order_id: string

    @column()
    declare buyer_name: string | null

    @column()
    declare buyer_email: string | null

    @column()
    declare buyer_phone: string | null

    @column()
    declare total_amount: number

    //foreign key
    @hasOne(() => Payment)
    declare payment_id: HasOne<typeof Payment>

    @hasOne(() => Event)
    declare event_id: HasOne<typeof Event>
    
    //timestampt
    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime<boolean> | null

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime<boolean> | null

    // uuid generator
    @beforeCreate()
    static assignUuid(order: Order) {
        if (!order.order_id) {
            order.order_id = uuidv4()
        }
    }

}