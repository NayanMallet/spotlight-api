import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Swagger Controller Import
const SwaggerController = () => import('#core/controllers/swagger_controller')

// GUEST region Controller's Imports
const LoginController = () => import('#auth/controllers/login_controller')
const RegisterController = () => import('#auth/controllers/register_controller')
const ResetPasswordController = () => import('#auth/controllers/reset_password_controller')
// endregion

// Swagger Documentation Routes
router.get('/docs', [SwaggerController, 'ui']).as('swagger.ui')
router.get('/docs/json', [SwaggerController, 'json']).as('swagger.json')

router.group(() => {
  router.post('login', [LoginController]).as('users.login')
  router.post('register', [RegisterController]).as('users.register')
  router.post('reset-password', [ResetPasswordController]).as('users.reset-password')
})

// CLIENT region Controller's Imports
const CreateEventController = () => import('#events/controllers/create_event_controller')
const GetEventsController = () => import('#events/controllers/get_events_controller')
const GetEventController = () => import('#events/controllers/get_event_controller')
const UpdateEventController = () => import('#events/controllers/update_event_controller')
const DeleteEventController = () => import('#events/controllers/delete_event_controller')
const UpdateUserController = () => import('#auth/controllers/update_user_controller')
const DeleteUserController = () => import('#auth/controllers/delete_user_controller')
const UploadUserBannerController = () => import('#auth/controllers/upload_user_banner_controller')
// endregion

// Pages CLIENT
router
  .group(() => {
    // Events CRUD routes
    router.get('/events', [GetEventsController]).as('events.index')
    router.post('/events', [CreateEventController]).as('events.store')
    router.get('/events/:id', [GetEventController]).as('events.show')
    router.put('/events/:id', [UpdateEventController]).as('events.update')
    router.patch('/events/:id', [UpdateEventController]).as('events.patch')
    router.delete('/events/:id', [DeleteEventController]).as('events.destroy')

    // Users management routes
    router.put('/users/me', [UpdateUserController]).as('users.update-me')
    router.put('/users/:id', [UpdateUserController]).as('users.update')
    router.delete('/users/me', [DeleteUserController]).as('users.delete-me')
    router.delete('/users/:id', [DeleteUserController]).as('users.delete')
    router.post('/users/:id/banner', [UploadUserBannerController]).as('users.upload-banner')
  })
  .middleware([middleware.auth()])
