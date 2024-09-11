import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'transactions'

    async up() {
        this.schema.createTable('transactions', (table) => {
            table.increments()
            table.string('transaction_hash').notNullable()
            table.integer('log_index').notNullable()
            table.string('method').nullable()
            table.integer('block').notNullable()
            table.integer('age').notNullable()
            table.string('user').nullable()
            table.bigInteger('args').nullable()
            // table.decimal('amount', 30, 18).nullable()
            table.integer('txn_fee').nullable()
            table.unique(['transaction_hash', 'log_index']) // Ensure uniqueness
            table.timestamps(true, true)
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
