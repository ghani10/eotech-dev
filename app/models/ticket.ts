import { TicketSchema } from '#database/schema'
import { beforeCreate, column, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import type { ManyToMany} from '@adonisjs/lucid/types/relations'
import Order from './order.ts'
import TicketType from './ticket_type.ts'



export default class Ticket extends TicketSchema {
    static primaryKey = 'ticket_id'

    @column({ isPrimary: true })
    declare ticket_id: string

    @column()
    declare qrcode: string

    @column()
    declare status_ticket: 'flash_sale' | 'reguler' | 'vip'

    @column()
    declare checkin_at: DateTime<boolean> | null

    @beforeCreate()
    static assignUuid(ticket: Ticket) {
        if (!ticket.ticket_id) {
            ticket.ticket_id = uuidv4()
        }
    }


    // foreign key
    @manyToMany(() => Order)
    declare order_id: ManyToMany<typeof Order>

    @hasOne(() => TicketType)
    declare ticket_type_id: HasOne<typeof TicketType>


    // timestamp
    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime<boolean> | null

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime<boolean> | null

}