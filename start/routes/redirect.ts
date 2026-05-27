import router from '@adonisjs/core/services/router'
import FallbackController from '#redirects/controllers/fallback_controller'
import app from '@adonisjs/core/services/app'

// Disable fallback during tests to prevent it from intercepting routes
if (!app.inTest) {
  router.any('*', [FallbackController, 'handle'])
}
