// import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LastCrawledBlock extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare blockNumber: number
}
