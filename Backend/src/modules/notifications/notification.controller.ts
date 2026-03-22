import { Request, Response, NextFunction } from 'express'
import { createNotification, deleteNotification, getNotifications, getUnreadCount, markAllAsRead, markAsRead } from './notification.services'


export const getNotificationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const result = await getNotifications(userId)
    res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const markAsReadController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const notificationId = req.params.id
    const result = await markAsRead(userId, notificationId as string)
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const markAllAsReadController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    await markAllAsRead(userId)
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

export const getUnreadCountController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const count = await getUnreadCount(userId)
    res.status(200).json({
      success: true,
      message: 'Unread count fetched successfully',
      data: { count }
    })
  } catch (error) {
    next(error)
  }
}

export const deleteNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId!
    const notificationId = req.params.id
    await deleteNotification(userId, notificationId as string)
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

