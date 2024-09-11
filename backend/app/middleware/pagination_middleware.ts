import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
// import UserService from '#services/user_service'

export default class PaginationMiddleware {
    async handle(ctx: HttpContext, next: NextFn) {
        /**
         * Middleware logic goes here (before the next call)
         */
        const { request } = ctx

        ctx.pagination = {
            perPage: Number(request.input('perPage', 10)),
            page: Number(request.input('page', 1)),
        }

        /**
         * Call next method in the pipeline and return its output
         */
        await next()
    }
}
