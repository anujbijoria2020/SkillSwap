import {Router} from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { deleteMessageController, getConversationsController, getMessagesForSwapController } from './messages.controllers';

const messageRouter = Router();

messageRouter.get("/", authMiddleware, getConversationsController);
messageRouter.get("/swaps/:swapId", authMiddleware, getMessagesForSwapController);
messageRouter.delete("/:id", authMiddleware, deleteMessageController);


export default messageRouter;