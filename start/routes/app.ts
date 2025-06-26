import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// GUEST region Controller's Imports
const LoginController = () => import('#users/controllers/login_controller')
const RegisterController = () => import('#users/controllers/register_controller')
// endregion

router.group(() => {
  router.post('login', [LoginController]).as('users.login')
  router.post('register', [RegisterController]).as('users.register')
})

// CLIENT region Controller's Imports
const CreateEventController = () => import('#events/controllers/create_event_controller')
const EventImageController = () => import('#events/controllers/event_image_controller')
// endregion

// Pages CLIENT
router
  .group(() => {
    router.post('/events', [CreateEventController])
    router.post('/events/image-upload', [EventImageController, 'upload'])
  })
  .middleware([middleware.auth()])
