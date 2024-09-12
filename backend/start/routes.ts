import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const HistoriesController = () => import('#controllers/histories_controller')

router
    .group(() => {
        router
            .get('/admin/:address/filter', [HistoriesController, 'adminFilter'])
            .use(middleware.pagination())
        router.get('/:address/filter', [HistoriesController, 'filter']).use(middleware.pagination())
        router
            .get('/admin/:address', [HistoriesController, 'showAdmin'])
            .use(middleware.pagination())
        router.get('/:address', [HistoriesController, 'show']).use(middleware.pagination())
    })
    .prefix('/history')
