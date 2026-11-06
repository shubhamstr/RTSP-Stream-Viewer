import { io, Socket } from 'socket.io-client'
import { ENV } from '../config/env'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(ENV.EXPRESS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log(`[Socket.io] Connected to server: ${socket?.id}`)
    })

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Disconnected: ${reason}`)
    })

    socket.on('connect_error', (error) => {
      console.warn(`[Socket.io] Connection error:`, error.message)
    })
  }

  return socket
}

export default getSocket

