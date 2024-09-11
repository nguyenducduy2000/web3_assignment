import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'

export default class HistoriesController {
    // [GET] /history
    index({}: HttpContext) {
        return Transaction.all()
    }

    // [GET] /history/:id
    show({ pagination, request, response }: HttpContext) {
        try {
            const address = request.param('address')
            console.log(pagination)

            // query find all transactions that has user address match with transaction.user
            return Transaction.query()
                .where('user', address)
                .paginate(pagination.page, pagination.perPage)
        } catch (error) {
            console.error('Fetch history error: ', error)
            response.status(500).json({ error: error.message })
        }
    }

    // [POST] /history/filter
    // [POST] /history/filter
    async filter({ pagination, request, response }: HttpContext) {
        try {
            const { hash, event, block } = request.only(['hash', 'event', 'block'])
            // console.log('filter:::', hash, event, block)

            let query = Transaction.query()

            // Filter by hash
            if (hash && hash.length > 0) {
                query = query.where('transaction_hash', hash)
            }

            // Filter by events
            if (event && event.length > 0) {
                query = query.whereIn('method', event)
            }

            // Filter by block range
            // if (block && block.length === 2) {
            //     const [minBlock, maxBlock] = block
            //     query = query.whereBetween('block', [minBlock, maxBlock])
            // }

            // Execute the query and return the results
            const data = await query.paginate(pagination.page, pagination.perPage)
            // console.log('data: ', data)
            return data
        } catch (error) {
            console.error('Filter history error: ', error)
            response.status(500).json({ error: error.message })
        }
    }
}
