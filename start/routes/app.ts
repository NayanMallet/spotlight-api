import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

// Swagger Documentation Routes
// returns swagger in YAML
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

// GUEST region Controller's Imports
const LoginController = () => import('#auth/controllers/login_controller')
const RegisterController = () => import('#auth/controllers/register_controller')
const ResetPasswordController = () => import('#auth/controllers/reset_password_controller')
const ForgotPasswordController = () => import('#auth/controllers/forgot_password_controller')
const OauthController = () => import('#auth/controllers/oauth_controller')
// endregion

router.group(() => {
  router.post('login', [LoginController]).as('users.login')
  router.post('register', [RegisterController]).as('users.register')
  router
    .get('reset-password/:token', [ResetPasswordController, 'show'])
    .as('users.reset-password-form')
  router.post('reset-password', [ResetPasswordController]).as('users.reset-password')
  router.post('forgot-password', [ForgotPasswordController]).as('users.forgot-password')
  router.get('oauth/google', [OauthController, 'redirect']).as('oauth.google.redirect')
  router.get('oauth/google/callback', [OauthController, 'callback']).as('oauth.google.callback')
})

// CLIENT region Controller's Imports
const CreateEventController = () => import('#events/controllers/create_event_controller')
const GetEventsController = () => import('#events/controllers/get_events_controller')
const GetEventController = () => import('#events/controllers/get_event_controller')
const UpdateEventController = () => import('#events/controllers/update_event_controller')
const DeleteEventController = () => import('#events/controllers/delete_event_controller')
const ScrapeEventsController = () => import('#events/controllers/scrape_events_controller')
const UpdateUserController = () => import('#auth/controllers/update_user_controller')
const DeleteUserController = () => import('#auth/controllers/delete_user_controller')
const UploadUserBannerController = () => import('#auth/controllers/upload_user_banner_controller')
const CreateMessageController = () => import('#messages/controllers/create_message_controller')
const GetMessagesController = () => import('#messages/controllers/get_messages_controller')
const GetMessageController = () => import('#messages/controllers/get_message_controller')
const UpdateMessageController = () => import('#messages/controllers/update_message_controller')
const DeleteMessageController = () => import('#messages/controllers/delete_message_controller')
const CreateArtistController = () => import('#artists/controllers/create_artist_controller')
const GetArtistsController = () => import('#artists/controllers/get_artists_controller')
const GetArtistController = () => import('#artists/controllers/get_artist_controller')
const UpdateArtistController = () => import('#artists/controllers/update_artist_controller')
const DeleteArtistController = () => import('#artists/controllers/delete_artist_controller')
const AddEventArtistsController = () => import('#events/controllers/add_event_artists_controller')
const RemoveEventArtistsController = () => import('#events/controllers/remove_event_artists_controller')
const GetEventArtistsController = () => import('#events/controllers/get_event_artists_controller')
// endregion

// Scraper route for testing
router.get('/scrap/events/toulouse', [ScrapeEventsController]).as('events.scrape')

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
    router.get('/artists', [GetArtistsController]).as('artists.index')
    router.post('/artists', [CreateArtistController]).as('artists.store')
    router.get('/artists/:id', [GetArtistController]).as('artists.show')
    router.put('/artists/:id', [UpdateArtistController]).as('artists.update')
    router.patch('/artists/:id', [UpdateArtistController]).as('artists.patch')
    router.delete('/artists/:id', [DeleteArtistController]).as('artists.destroy')

    // Event-Artist relationship management routes
    router.get('/events/:id/artists', [GetEventArtistsController]).as('events.artists.index')
    router.post('/events/:id/artists', [AddEventArtistsController]).as('events.artists.add')
    router.delete('/events/:id/artists', [RemoveEventArtistsController]).as('events.artists.remove')

    // Users management routes
    router.put('/users/me', [UpdateUserController]).as('users.update-me')
    router.put('/users/:id', [UpdateUserController]).as('users.update')
    router.delete('/users/me', [DeleteUserController]).as('users.delete-me')
    router.delete('/users/:id', [DeleteUserController]).as('users.delete')
    router.post('/users/:id/banner', [UploadUserBannerController]).as('users.upload-banner')

    // OAuth management routes
    router.delete('/oauth/google/unlink', [OauthController, 'unlink']).as('oauth.google.unlink')
  })
  .middleware([middleware.auth()])
