import { Server } from 'socket.io'

class SocketService {
  private io: Server | null = null

  boot(io: Server): void {
    this.io = io
  }

  emitToEvent(eventId: string | number, event: string, data: unknown): void {
    this.io?.to(`event:${eventId}`).emit(event, data)
  }
}

export default new SocketService()
