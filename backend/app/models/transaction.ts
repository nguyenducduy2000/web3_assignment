import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { BigNumber } from 'ethers'

export default class Transaction extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column({ columnName: 'transaction_hash' })
    declare transactionHash: string

    @column({ columnName: 'log_index' })
    declare logIndex: number

    @column()
    declare method: string

    @column()
    declare block: number

    @column()
    declare age: number

    @column()
    declare from: string

    @column()
    declare to: string

    @column()
    declare user: string

    @column()
    declare args: BigNumber | number | string

    // @column()
    // declare amount: number | string

    @column({ columnName: 'txn_fee' })
    declare txnFee: BigNumber | number | string

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
}
