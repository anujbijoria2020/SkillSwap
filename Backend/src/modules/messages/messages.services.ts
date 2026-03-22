import ApiError from "../../utils/ApiError"
import { prisma } from "../../config/prisma"

// get all conversations for a user (inbox)
export const getConversations = async (userId: string) => {
  const swaps = await prisma.swap.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [
        { initiatorId: userId },
        { receiverId: userId }
      ]
    },
    include: {
      initiator: { select: { id: true, name: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1  // last message preview
      }
    }
  })

  return swaps.map(swap => {
    const participant = swap.initiatorId === userId ? swap.receiver : swap.initiator
    const lastMessage = swap.messages[0]

    return {
      id: swap.id,
      participantId: participant.id,
      participantName: participant.name,
      participantAvatar: participant.avatarUrl || undefined,
      lastMessage: lastMessage?.content || '',
      unreadCount: 0,
      updatedAt: lastMessage?.createdAt || swap.updatedAt,
    }
  })
}

// get full chat history for a specific swap
export const getMessages = async (userId: string, swapId: string) => {
  const swap = await prisma.swap.findUnique({ where: { id: swapId } })
  if (!swap) throw new ApiError(404, 'Swap not found')
  if (swap.initiatorId !== userId && swap.receiverId !== userId) {
    throw new ApiError(403, 'Not authorized')
  }

  const messages = await prisma.message.findMany({
    where: { swapId },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'asc' }  // oldest first for chat UI
  })

  return messages.map((message) => ({
    ...message,
    conversationId: message.swapId,
    read: true,
  }))
}

export const sendMessageViaRest = async (senderId: string, swapId: string, content: string) => {
  const swap = await prisma.swap.findUnique({ where: { id: swapId } })
  if (!swap) throw new ApiError(404, 'Swap not found')
  if (swap.status !== 'ACCEPTED') throw new ApiError(400, 'Swap must be accepted to send messages')
  if (senderId !== swap.initiatorId && senderId !== swap.receiverId) {
    throw new ApiError(403, 'Not authorized')
  }

  const receiverId = senderId === swap.initiatorId ? swap.receiverId : swap.initiatorId

  const message = await prisma.message.create({
    data: { swapId, senderId, receiverId, content },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } }
    }
  })

  return message
}

// delete a message (only sender can delete)
export const deleteMessage = async (userId: string, messageId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) throw new ApiError(404, 'Message not found')
  if (message.senderId !== userId) throw new ApiError(403, 'Not authorized')

  await prisma.message.delete({ where: { id: messageId } })
  return { message: 'Message deleted' }
}