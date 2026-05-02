import type { ApplicationService } from '@adonisjs/core/types'
import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import { Secret } from '@adonisjs/core/helpers'
import User from '#auth/models/user'
import socketService from '#socket/socket_service'

export default class SocketIoProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    const io = new Server(server.getNodeServer(), {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    io.use(async (socket, next) => {
      const rawToken = socket.handshake.auth?.token?.replace(/^Bearer\s+/i, '')
      if (!rawToken) return next(new Error('Authentication required'))

      try {
        const accessToken = await User.accessTokens.verify(new Secret(rawToken))
        if (!accessToken) return next(new Error('Invalid token'))

        const user = await User.find(accessToken.tokenableId)
        if (!user) return next(new Error('User not found'))

        socket.data.user = user
        next()
      } catch {
        next(new Error('Authentication failed'))
      }
    })

    io.on('connection', (socket) => {
      socket.on('join:event', (eventId: string) => {
        socket.join(`event:${eventId}`)
      })

      socket.on('leave:event', (eventId: string) => {
        socket.leave(`event:${eventId}`)
      })
    })

    socketService.boot(io)
  }
}
