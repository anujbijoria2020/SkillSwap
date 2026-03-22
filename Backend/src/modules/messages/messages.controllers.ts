import { Request, Response,NextFunction } from "express";
import ApiError from "../../utils/ApiError";
import { deleteMessage, getConversations, getMessages, sendMessageViaRest } from "./messages.services";

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
        const swapId = (req.params.swapId || req.params.id) as string
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

export const sendMessageViaRestController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId!
        const swapId = req.params.id as string
        const { content } = req.body
        if (!content) throw new ApiError(400, 'Content is required')

        const result = await sendMessageViaRest(userId, swapId, content)
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: result
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