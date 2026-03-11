// import type { HttpContext } from '@adonisjs/core/http'

import { request } from "http"
import { Logger } from "@adonisjs/core/logger"

export default class EventsController {

    async index({request, response} : HttpContext) {
        const payload = request.body()
        const page = 1

        if(!payload){
            return response.json({
                message: 'error data empty',
            })
        }

        const query = 
        
        

    }


}