interface Pagination {
    perPage: number
    page: number
}

declare module '@adonisjs/core/http' {
    interface HttpContext {
        pagination: Pagination
    }
}
