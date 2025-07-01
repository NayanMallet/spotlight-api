import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import EventScraper from '#config/EventScraper'

// Swagger Documentation Routes
// returns swagger in YAML
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

router.get('/scrap/events/toulouse', async () => {
  const events = await EventScraper.fetchShotgunEvents()
  return events
})

// GUEST region Controller's Imports
const LoginController = () => import('#auth/controllers/login_controller')
const RegisterController = () => import('#auth/controllers/register_controller')
const ResetPasswordController = () => import('#auth/controllers/reset_password_controller')
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
const UpdateUserController = () => import('#auth/controllers/update_user_controller')
const DeleteUserController = () => import('#auth/controllers/delete_user_controller')
const UploadUserBannerController = () => import('#auth/controllers/upload_user_banner_controller')
const CreateMessageController = () => import('#messages/controllers/create_message_controller')
const GetMessagesController = () => import('#messages/controllers/get_messages_controller')
const GetMessageController = () => import('#messages/controllers/get_message_controller')
const UpdateMessageController = () => import('#messages/controllers/update_message_controller')
const DeleteMessageController = () => import('#messages/controllers/delete_message_controller')
const CreateArtistController = () => import('#artists/controllers/create_artist_controller')
const UpdateArtistController = () => import('#artists/controllers/update_artist_controller')
const DeleteArtistController = () => import('#artists/controllers/delete_artist_controller')
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

    // Messages CRUD routes
    router.post('/messages', [CreateMessageController]).as('messages.store')
    router.get('/events/:eventId/messages', [GetMessagesController]).as('messages.index')
    router.get('/messages/:id', [GetMessageController]).as('messages.show')
    router.put('/messages/:id', [UpdateMessageController]).as('messages.update')
    router.patch('/messages/:id', [UpdateMessageController]).as('messages.patch')
    router.delete('/messages/:id', [DeleteMessageController]).as('messages.destroy')

    // Artists CRUD routes
    router.post('/artists', [CreateArtistController]).as('artists.store')
    router.put('/artists/:id', [UpdateArtistController]).as('artists.update')
    router.patch('/artists/:id', [UpdateArtistController]).as('artists.patch')
    router.delete('/artists/:id', [DeleteArtistController]).as('artists.destroy')

    // Users management routes
    router.put('/users/me', [UpdateUserController]).as('users.update-me')
    router.put('/users/:id', [UpdateUserController]).as('users.update')
    router.delete('/users/me', [DeleteUserController]).as('users.delete-me')
    router.delete('/users/:id', [DeleteUserController]).as('users.delete')
    router.post('/users/:id/banner', [UploadUserBannerController]).as('users.upload-banner')
  })
  .middleware([middleware.auth()])
