import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// GUEST region Controller's Imports
const LoginController = () => import('#users/controllers/login_controller')
const RegisterController = () => import('#users/controllers/register_controller')
const ResetPasswordController = () => import('#users/controllers/reset_password_controller')
// endregion

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
const UpdateUserController = () => import('#users/controllers/update_user_controller')
const DeleteUserController = () => import('#users/controllers/delete_user_controller')
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
  })
  .middleware([middleware.auth()])
