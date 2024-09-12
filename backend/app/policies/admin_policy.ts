// import User from '#models/user'
// import Admin from '#models/admin'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import dotenv from 'dotenv'
dotenv.config()
export default class AdminPolicy extends BasePolicy {
    view(address: string): AuthorizerResponse {
        return address === process.env.OWNER
    }
}
