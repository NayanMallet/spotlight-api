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
import EventScraper from '../app/services/EventScraper.ts'
const EventController = () => import('../app/controllers/event_controller.ts')


router.get('/scrap/events/toulouse', async () => {
  const events = await EventScraper.fetchShotgunEvents()
  return events
})
router.get('/events/toulouse', [EventController, 'get'])
