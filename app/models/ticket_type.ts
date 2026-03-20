import { TicketTypeSchema } from '#database/schema'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Event from './event.ts'

export default class TicketType extends TicketTypeSchema {
    static primaryKey = 'ticket_type_id'

    @column({ isPrimary: true })
    declare ticket_type_id: string

    @column()
    declare ticket_name: string

    @column()
    declare price: number | null

    @column()
    declare quota: number | null

    @column()
    declare sales_start_date: DateTime<boolean> | null

    @column()
    declare sales_end_date: DateTime<boolean> | null

    @column()
    declare per_order_limit: number | null

    @column()
    declare description: string | null

    // foreign key
    @hasMany(() => Event)
    declare event_id: HasMany<typeof Event>


    // timestampt
    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime<boolean> | null

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime<boolean> | null


    // create uuid
    @beforeCreate()
    static assignUuid(ticket_type: TicketType) {
        if (!ticket_type.ticket_type_id) {
            ticket_type.ticket_type_id = uuidv4()
        }
    }

    
}