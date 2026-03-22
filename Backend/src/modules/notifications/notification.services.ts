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
  const settings = await prisma.userSettings.findUnique({
    where: { userId }
  })

  const shouldCreate = (() => {
    if (!settings) return true

    switch (type) {
      case 'swap_request':
      case 'swap_accepted':
        return settings.notifSwaps
      case 'new_message':
        return settings.notifMessages
      case 'new_review':
        return settings.notifReviews
      default:
        return true
    }
  })()

  if (!shouldCreate) return null

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
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true }
  })

  if (result.count === 0) throw new ApiError(404, 'Notification not found')
  return null
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
  const result = await prisma.notification.deleteMany({
    where: { id: notificationId, userId }
  })

  if (result.count === 0) throw new ApiError(404, 'Notification not found')
  return null
}