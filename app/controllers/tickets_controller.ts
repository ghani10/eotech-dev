import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'



export default class TicketsController {

    /**
     * Generate a trace message ID for each request lifecycle
     */
    private generateMessageId(): string {
        return `Ticket-Ctrl-${Date.now()}-${randomUUID().split('-')[0].toUpperCase()}`
    }

    /**
     * Get Data Ticket By pagination
     * 
     */

    async index({ request, response, logger }: HttpContext) {
        const messageId = this.generateMessageId()
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)
        const status = request.input('status') // filter by EventStatus: pending | published | archived

        // validation
        if (!page || !limit){
            return response.badRequest({
                messageId: messageId,
                message: 'Request not allowed, please back to home page'
            })
        }

        logger.info({ messageId, page, limit, status }, '[INDEX] Fetching event list')

        const dataTicket = await db.from('tickets').paginate(page, limit)

        return response.ok({
            message_id: messageId,
            message: 'success',
            data: dataTicket,
        })
    }


    /**
     * Create ticket by order events
     * 
     */
    
}