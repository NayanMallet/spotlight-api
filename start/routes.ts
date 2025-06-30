import './routes/app.js'
import './routes/redirect.js'
/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import EventScraper from '#services/EventScraper'
const AuthController = () => import('#controllers/auth_controller')
const EventController = () => import('#controllers/event_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])
router.get('/scrap/events/toulouse', async () => {
  const events = await EventScraper.fetchShotgunEvents()
  return events
})
router.get('/events/toulouse', [EventController, 'get'])
