import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import {
  getConversationsController,
  getMessagesForSwapController,
  sendMessageViaRestController
} from './messages.controllers'

const conversationRouter = Router()

// GET /api/conversations -> get all conversations
conversationRouter.get('/', authMiddleware, getConversationsController)

// GET /api/conversations/:id/messages -> get messages for a swap
conversationRouter.get('/:id/messages', authMiddleware, getMessagesForSwapController)

// POST /api/conversations/:id/messages -> send message via REST
conversationRouter.post('/:id/messages', authMiddleware, sendMessageViaRestController)

export default conversationRouter
