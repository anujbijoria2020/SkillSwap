import {Router} from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { deleteMessageController, getConversationController, getMessagesForSwapController, sendMessageController } from './messages.controllers';

const messageRouter = Router();

messageRouter.get("/", authMiddleware, getConversationController);
messageRouter.get("/swaps/:swapid", authMiddleware, getMessagesForSwapController);
messageRouter.post("/swaps/:swapid", authMiddleware, sendMessageController);
messageRouter.delete("/:messageid", authMiddleware, deleteMessageController);


export default messageRouter;