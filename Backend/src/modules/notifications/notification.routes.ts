import { Router } from "express"
import {
  getNotificationsController,
  getUnreadCountController,
  markAllAsReadController,
  markAsReadController,
  deleteNotificationController
} from "./notification.controller"
import { authMiddleware } from "../../middleware/auth.middleware"

const notificationRouter = Router()

// specific routes first
notificationRouter.get('/', authMiddleware, getNotificationsController)
notificationRouter.get('/unread-count', authMiddleware, getUnreadCountController)
notificationRouter.patch('/read-all', authMiddleware, markAllAsReadController)

// dynamic routes last
notificationRouter.patch('/:id/read', authMiddleware, markAsReadController)
notificationRouter.delete('/:id', authMiddleware, deleteNotificationController)

export default notificationRouter