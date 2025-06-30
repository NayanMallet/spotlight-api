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
const EventController = () => import('#controllers/event_controller')


router.get('/scrap/events/toulouse', async () => {
  const events = await EventScraper.fetchShotgunEvents()
  return events
})
router.get('/events/toulouse', [EventController, 'get'])
