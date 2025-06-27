import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'

export default class EventImageController {
  async upload({ request, response }: HttpContext) {
    const image = request.file('image', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!image) {
      return response.badRequest({ message: 'No image provided' })
    }

    const fileName = `${cuid()}.${image.extname}`

    await image.move(app.publicPath('uploads/events'), {
      name: fileName,
      overwrite: true,
    })

    return {
      url: `/uploads/events/${fileName}`,
    }
  }
}
