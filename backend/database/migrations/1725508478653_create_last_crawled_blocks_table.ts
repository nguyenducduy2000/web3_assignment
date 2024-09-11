import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'last_crawled_blocks'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id') // Primary key
            table.integer('block_number').notNullable() // Last crawled block number
            table.timestamps(true, true) // Adds created_at and updated_at timestamps
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
