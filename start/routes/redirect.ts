import router from '@adonisjs/core/services/router'
import FallbackController from '#redirects/controllers/fallback_controller'

router.any('*', [FallbackController, 'handle'])
