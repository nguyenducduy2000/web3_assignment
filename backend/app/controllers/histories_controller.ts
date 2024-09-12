import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
export default class HistoriesController {
    // [GET] /history/:address
    show({ pagination, request, response }: HttpContext) {
        try {
            // console.log('running show')
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
            // console.log('running filter')
            const address = request.param('address')
            const { hash, event, block } = request.only(['hash', 'event', 'block'])
            // console.log('filter:::', hash, event, block)

            let query = Transaction.query().where('user', address)

            // Filter by hash
            if (hash && hash.length > 0) {
                query = query.where('transaction_hash', hash)
            }

            // Filter by events
            if (event && event.length > 0) {
                query = query.whereIn('method', event)
            }

            // Filter by block range
            if (block && block.length === 2) {
                const [minBlock, maxBlock] = block
                query = query.whereBetween('block', [minBlock, maxBlock])
            }

            // Execute the query and return the results
            const data = await query.paginate(pagination.page, pagination.perPage)
            // console.log('data: ', data)
            return data
        } catch (error) {
            console.error('Filter history error: ', error)
            response.status(500).json({ error: error.message })
        }
    }

    // [GET] /history/admin/:address
    async showAdmin({ pagination, request, response }: HttpContext) {
        try {
            console.log('running show admin')
            const address = request.param('address')
            const isAdmin = address === process.env.OWNER

            if (!isAdmin) {
                return response.forbidden('Access denied: User is not admin')
            }
            // console.log('running as admin...')
            const query = Transaction.query().paginate(pagination.page, pagination.perPage)
            return query
        } catch (error) {
            console.error('Fetch history error: ', error)
            response.status(500).json({ error: error.message })
        }
    }

    async adminFilter({ pagination, request, response }: HttpContext) {
        try {
            // console.log('running admin filter')
            const address = request.param('address')
            const { hash, event, block } = request.only(['hash', 'event', 'block'])
            // console.log('filter:::', hash, event, block)
            const isAdmin = address === process.env.OWNER
            console.log(isAdmin)
            if (!isAdmin) {
                return response.forbidden('Access denied: User is not admin')
            }

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
            if (block && block.length === 2) {
                const [minBlock, maxBlock] = block
                query = query.whereBetween('block', [minBlock, maxBlock])
            }

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
