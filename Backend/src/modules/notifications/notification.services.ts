import { prisma } from '../../config/prisma'
import ApiError from '../../utils/ApiError'

// called from other services — swaps, reviews, socket
export const createNotification = async (
  userId: string, 
  actorId: string,      // who triggered it
  type: string,         // 'swap_request' | 'swap_accepted' | 'new_message' | 'new_review'
  message: string,      // human readable message
  link: string          // frontend route e.g. '/swaps'
) => {
  return prisma.notification.create({
    data: { userId, actorId, type, message, link }
  })
}

export const getNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    include: {
      actor: {
        select: { id: true, name: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const markAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  })
  if (!notification) throw new ApiError(404, 'Notification not found')
  if (notification.userId !== userId) throw new ApiError(403, 'Not authorized')

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true }
  })
}

export const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  })
  return null
}

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { userId, read: false }
  })
}

export const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  })
  if (!notification) throw new ApiError(404, 'Notification not found')
  if (notification.userId !== userId) throw new ApiError(403, 'Not authorized')

  await prisma.notification.delete({ where: { id: notificationId } })
  return null
}