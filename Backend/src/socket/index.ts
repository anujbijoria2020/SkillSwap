

import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import { verifyAccessToken } from '../utils/jwt'
import { prisma } from '../config/prisma'
import { logger } from '../config/logger'

export const initSocket = (httpServer: HttpServer) => {
 const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  allowEIO3: true  // allow older Socket.IO client versions
})

  // auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1] as string;
    if (!token) return next(new Error('Authentication error'))
    try {
      const payload = verifyAccessToken(token)
      socket.data.userId = payload.userId
      next()
    } catch {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
logger.info(`User connected: ${socket.data.userId}, socket id: ${socket.id}`)

  socket.onAny((event, ...args) => {
    logger.info(`Event received: ${event}`, args)
  })
    // join a swap room
    socket.on('join_swap', (swapId: string) => {
      socket.join(swapId)
      logger.info(`User ${socket.data.userId} joined swap ${swapId}`)
    })

    // leave a swap room
    socket.on('leave_swap', (swapId: string) => {
      socket.leave(swapId)
      logger.info(`User ${socket.data.userId} left swap ${swapId}`)
    })

    // send message
    socket.on('send_message', async (data: { swapId: string, content: string }) => {
       logger.info('message received by server:', data) 
       logger.info(`User ${socket.data.userId} is sending a message to swap ${data.swapId}`)
      try {
        const { swapId, content } = data
        const senderId = socket.data.userId

        // save to DB
        const swap = await prisma.swap.findUnique({ where: { id: swapId } })
        if (!swap) return
        if (swap.initiatorId !== senderId && swap.receiverId !== senderId) return

        const receiverId = senderId === swap.initiatorId ? swap.receiverId : swap.initiatorId

        const message = await prisma.message.create({
          data: { swapId, senderId, receiverId, content },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } }
          }
        })

        // emit to everyone in the swap room including sender
        io.to(swapId).emit('new_message', message)
         logger.info(`message emitted by server to swapId ${swapId}:`, message)
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.data.userId}`)
    })
  })

  return io
}