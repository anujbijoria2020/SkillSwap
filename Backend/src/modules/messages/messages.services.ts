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

  return swaps.map(swap => ({
    swapId: swap.id,
    with: swap.initiatorId === userId ? swap.receiver : swap.initiator,
    lastMessage: swap.messages[0] || null,
    skillOffered: swap.skillOffered,
    skillWanted: swap.skillWanted
  }))
}

// get full chat history for a specific swap
export const getMessages = async (userId: string, swapId: string) => {
  const swap = await prisma.swap.findUnique({ where: { id: swapId } })
  if (!swap) throw new ApiError(404, 'Swap not found')
  if (swap.initiatorId !== userId && swap.receiverId !== userId) {
    throw new ApiError(403, 'Not authorized')
  }

  return prisma.message.findMany({
    where: { swapId },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } }
    },
    orderBy: { createdAt: 'asc' }  // oldest first for chat UI
  })
}

// delete a message (only sender can delete)
export const deleteMessage = async (userId: string, messageId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) throw new ApiError(404, 'Message not found')
  if (message.senderId !== userId) throw new ApiError(403, 'Not authorized')

  await prisma.message.delete({ where: { id: messageId } })
  return { message: 'Message deleted' }
}