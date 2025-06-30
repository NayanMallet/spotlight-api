import Message from '#messages/models/message'
import { inject } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'

export class CreateMessageData {
  declare eventId: string
  declare content: string
}

export class UpdateMessageData {
  declare content: string
}

export class GetMessagesByEventOptions {
  declare page?: number
  declare limit?: number
}

@inject()
export class MessagesService {
  async create(data: CreateMessageData, userId: string): Promise<Message> {
    const message = new Message()
    message.id = cuid()
    message.userId = userId
    message.eventId = data.eventId
    message.content = data.content

    await message.save()
    await message.load('user')
    await message.load('event')

    return message
  }

  async getByEventId(eventId: string, options: GetMessagesByEventOptions = {}) {
    const page = options.page || 1
    const limit = options.limit || 20

    const messages = await Message.query()
      .where('eventId', eventId)
      .preload('user')
      .preload('event')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return messages
  }

  async getById(id: string): Promise<Message | null> {
    const message = await Message.query()
      .where('id', id)
      .preload('user')
      .preload('event')
      .first()

    return message
  }

  async update(id: string, data: UpdateMessageData, userId: string): Promise<Message | null> {
    const message = await Message.find(id)

    if (!message) {
      return null
    }

    // Check if the user owns this message
    if (message.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own messages')
    }

    message.content = data.content
    await message.save()
    await message.load('user')
    await message.load('event')

    return message
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const message = await Message.find(id)

    if (!message) {
      return false
    }

    // Check if the user owns this message
    if (message.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own messages')
    }

    await message.delete()
    return true
  }
}
