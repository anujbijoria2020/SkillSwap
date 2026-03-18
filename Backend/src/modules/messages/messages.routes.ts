import {Router} from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { deleteMessageController, getConversationController, getMessagesForSwapController } from './messages.controllers';

const messageRouter = Router();

messageRouter.get("/", authMiddleware, getConversationController);
messageRouter.get("/swaps/:swapid", authMiddleware, getMessagesForSwapController);
messageRouter.delete("/:messageid", authMiddleware, deleteMessageController);


export default messageRouter;