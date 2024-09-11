import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const HistoriesController = () => import('#controllers/histories_controller')

router
    .group(() => {
        router.get('/:address', [HistoriesController, 'show']).use(middleware.pagination())
        router
            .post('/:address/filter', [HistoriesController, 'filter'])
            .use(middleware.pagination())
    })
    .prefix('/history')
