import { Request, Response,NextFunction } from "express";
import { deleteMessage, getConversations, getMessages } from "./messages.services";

export const getConversationsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId!
        // Fetch messages for the swap and ensure the user is either sender or receiver
        const swaps = await getConversations(userId);
        res.status(200).json({
            success: true,
            message: "Conversations fetched successfully",
            data: swaps
        })
    } catch (error) {
        next(error)
    }
}

export const getMessagesForSwapController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId!
        const swapId = req.params.swapId as string
        // Fetch messages for the swap and ensure the user is either sender or receiver
        const messages = await getMessages(userId, swapId);
        res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            data: messages
        })
    } catch (error) {
        next(error)
    }
}


export const deleteMessageController = async(req:Request,res:Response,next:NextFunction)=>{
    try{
       const userId = req.user?.userId!;
       const messageId = req.params.id as string;
       // Implement deleteMessage service to remove the message
       await deleteMessage(userId, messageId);
       res.status(200).json({
           success: true,
           message: "Message deleted successfully",
           data: null
       })

    }catch(error){
        next(error)
    }
}